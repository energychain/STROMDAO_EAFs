"use strict";
/**
 *  Model to provide debit management service
 */


const DbService = require("moleculer-db");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "debit",
	

	/**
	 * Dependencies
	 */
	dependencies: ["debit_model"],

	/**
	 * Actions
	 */
	actions: {

		assets: {
			rest: {
				method: "GET",
				path: "/assets"
			},
			async handler(ctx) {
				if((typeof ctx.params.q == 'undefined') || (ctx.params.q.length == 0)) {
					return (await ctx.call("debit_model.list",{ pageSize: 50,sort:"-clearingTime"})).rows;
				} else {
					return await ctx.call("debit_model.find",{search:ctx.params.q,searchFields:['meterId']});
				}
			}
		},
		open: {
			rest: {
				method: "GET",
				path: "/open"
			},
			params: {
				meterId:"string"
			},
			openapi: {
				summary: "Outstanding (open) debits of given meter"
			},
			async handler(ctx) {
				if((typeof ctx.meta.user !== 'undefined') && ((typeof ctx.meta.user.meterId !== 'undefined') || (typeof ctx.meta.user.concentratorId !== 'undefined'))) {
					// Ensure Authenticated Token is authorized
					if(typeof ctx.meta.user.concentratorId !== 'undefined') {
							// a Concentrator is a wildcard MPO allowed to update any meterId.
					} else {
						if(ctx.meta.user.meterId !== ctx.params.meterId) {
							throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
						}
					}
				}
				let res =  await ctx.call("debit_model.find",{query:{meterId:ctx.params.meterId}});
				if(res.length == 0) {
					return {}
				} else {
					delete res[0]._id;
					return res[0];
				}
			}
		},
		delayed: {
			rest: {
				method: "GET",
				path: "/delayed"
			},
			async handler(ctx) {
				if(typeof ctx.params.delay == 'undefined') ctx.params.delay = 86400000;
				return await ctx.call("debit_model.find",{query:{"clearingTime": {"$lt": new Date().getTime()-(1 * ctx.params.delay)}}});
			}
		},
		add: {
			rest: {
				method: "put",
				path: "/add"
			},
			params: {
				"meterId": "string",
				"clearingTime": "number",
				"cost": "number"
			},
			openapi: {
				summary: "Add line item to debit account",
				description: "Add a position to the next invoice of a client identified by meterId.",
				responses: {
					200: {
						"description": "Price Information as given in request",
						"content": {
						"application/json": {
							"schema": {
								"type": `object`,
								"properties": {
									"virtual_1": { 
										type: `number`, 
										description: `kWh price of tariff 1` ,
										example: 0.2
									},
									"virtual_2": { 
										type: `number`, 
										description: `kWh price of tariff 2` ,
										example: 0.31
									},
									"virtual_3": { 
										type: `number`, 
										description: `kWh price of tariff 3` ,
										example: 0.39
									}
								}
							},
							"example": {
								"virtual_1": 0.2,
								"virtual_2": 0.31,
								"virtual_3": 0.39
							}
						},
						},
					},
				},
			},
			async handler(ctx) {
				const existingInvoice = await ctx.call("debit_model.find",{search:ctx.params.meterId,searchFields:['meterId']});
				const invoice = ctx.params;
				if (existingInvoice.length > 0) {
					let current_debit = existingInvoice[0];
					for (const [key, value] of Object.entries(current_debit)) {
						if((key.indexOf('cost') == 0) || (key.indexOf('consumption') == 0)) {
							invoice[key] = (1* value) + (1 * invoice[key]);
						}
						if(key == '_id') {
							invoice.id = value;
						}
						if(key == 'id') {
							invoice.id = value;
						}
						if(key == 'reading') {
							invoice.reading = value;
						}
					} 
				}
				if(typeof invoice.invoice == 'undefined') {
					invoice.invoice = {
						opening: new Date().getTime(),
						startReading:invoice.reading,
						startEpoch:Math.floor(new Date().getTime() / process.env.EPOCH_DURATION)
					}
				}
				if(typeof invoice.id == 'undefined') {
					await ctx.call("debit_model.insert",{entity:invoice});
				} else {
					await ctx.call("debit_model.update",invoice);
				}
				await ctx.broker.broadcast("debit.add", invoice);
				return invoice;
			}
		},
		closeBilling: {
			rest: {
				method: "GET",
				path: "/closeBilling"
			},
			params: {
				"meterId": "string"
			},
			async handler(ctx) {
				const debits = await ctx.call("debit_model.find",{search:ctx.params.meterId,searchFields:['meterId']});
				if(debits.length > 0) {
					let current_debit = debits[0];
					current_debit.invoice.closing = new Date().getTime();
					current_debit.invoice.endEpoch = Math.floor(new Date().getTime() / process.env.EPOCH_DURATION);
					current_debit.invoice.endReading = current_debit.reading;

					// update Reading to ensure "new start"
					let rt = await ctx.call("metering.updateReading", {
						meterId: current_debit.meterId,
						reading: current_debit.reading,
						time:current_debit.invoice.closing
					});

					if(rt.processed == false ) {
						// expected if we have a reading in current period.
						current_debit.invoice.endReading = rt.reading;
						rt = await ctx.call("metering.updateReading", {
							meterId: current_debit.meterId,
							reading: current_debit.invoice.endReading,
							time:current_debit.invoice.closing
						});
						rt.closedByDebit=true;
					} else {
						rt.closedByDebit=false;
					}
					current_debit.finalReading = rt;
					// Collect all clearances in Time Frame
					current_debit.invoice.opening = 0 // TODO Set with previous credit note

					let offset = 0;
					let results = 100;

					let transient_clearing = {
						meterId:current_debit.meterId,
						reading:current_debit.invoice.endReading,
						endTime:current_debit.invoice.closing
					}
					
					while(results == 100) {
						let clearings = await ctx.call("clearing.find",{query:{
							meterId:current_debit.meterId,
							startTime:{ "$gte": current_debit.invoice.opening, "$lte":current_debit.invoice.closing }
						},sort:"-clearingTime",limit:100,offset:offset,populate:["consumption","cost","consumption_virtual_1","consumption_virtual_2","consumption_virtual_3","consumption_virtual_4","consumption_virtual_5","consumption_virtual_6","consumption_virtual_7","consumption_virtual_8","consumption_virtual_9","cost_virtual_1","cost_virtual_2","cost_virtual_3","cost_virtual_4","cost_virtual_5","cost_virtual_6","cost_virtual_7","cost_virtual_8","cost_virtual_9"]});
						results = clearings.length;
						offset += clearings.length;
						for(let i=0;i<clearings.length;i++) {
							for (const [key, value] of Object.entries(clearings[i])) {

								if(key.indexOf('cost') == 0) {
									if(typeof transient_clearing[key] == 'undefined') {
										transient_clearing[key] = 0;
									}
									transient_clearing[key] += (-1) * value;
								} 
								if(key.indexOf('consumption') == 0) {
									if(typeof transient_clearing[key] == 'undefined') {
										transient_clearing[key] = 0;
									}
									transient_clearing[key] += (-1) * value;
								} 
							}
						}
					}

					console.log('Transient Clearing',transient_clearing);

					await ctx.call("debit_model.remove",{id:current_debit._id});
					delete current_debit._id;
				
					current_debit.clearing = await ctx.call("clearing.commit",transient_clearing);
					current_debit.jwt = await ctx.call("access.createInvoiceJWT",current_debit);
					await ctx.call("invoice_model.insert",{entity:current_debit});
					await ctx.broker.emit("invoice.created", current_debit);
					return current_debit;

				} else {
					throw new Error("No invoice found for meterId " + ctx.params.meterId);
				}
			}
		}

	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
