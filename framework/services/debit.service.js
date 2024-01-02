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
	
	adapter: process.db_adapter,
	
	collection: "debit",

	mixins: [DbService],
	/**
	 * Settings
	 */
	settings: {
		fields: ["_id", "meterId", "clearingTime","reading","startReading","startTime","cost","consumption","consumption_virtual_1","consumption_virtual_2","consumption_virtual_3","consumption_virtual_4","consumption_virtual_5","consumption_virtual_6","consumption_virtual_7","consumption_virtual_8","consumption_virtual_9","cost_virtual_1","cost_virtual_2","cost_virtual_3","cost_virtual_4","cost_virtual_5","cost_virtual_6","cost_virtual_7","cost_virtual_8","cost_virtual_9","invoice"],
    },

	/**
	 * Dependencies
	 */
	dependencies: [],

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
					return (await ctx.call("debit.list",{ pageSize: 50,sort:"-clearingTime"})).rows;
				} else {
					return await ctx.call("debit.find",{search:ctx.params.q,searchFields:['meterId']});
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
				return await ctx.call("debit.find",{query:{"clearingTime": {"$lt": new Date().getTime()-(1 * ctx.params.delay)}}});
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
				const existingInvoice = await ctx.call("debit.find",{search:ctx.params.meterId,searchFields:['meterId']});
				const invoice = ctx.params;
				if (existingInvoice.length > 0) {
					let current_invoice = existingInvoice[0];
					for (const [key, value] of Object.entries(current_invoice)) {
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
					await ctx.call("debit.insert",{entity:invoice});
				} else {
					await ctx.call("debit.update",invoice);
				}
				await ctx.broker.emit("debit.add", invoice);
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
				const invoices = await ctx.call("debit.find",{search:ctx.params.meterId,searchFields:['meterId']});
				if(invoices.length > 0) {
					let current_invoice = invoices[0];
					current_invoice.invoice.closing = new Date().getTime();
					current_invoice.invoice.endEpoch = Math.floor(new Date().getTime() / process.env.EPOCH_DURATION);
					current_invoice.invoice.endReading = current_invoice.reading;

					// update Reading to ensure "new start"
					let rt = await ctx.call("metering.updateReading", {
						meterId: current_invoice.meterId,
						reading: current_invoice.reading,
						time:current_invoice.invoice.closing
					});
					if(rt.processed == false ) {
						// expected if we have a reading in current period.
						current_invoice.invoice.endReading = rt.reading;
						rt = await ctx.call("metering.updateReading", {
							meterId: current_invoice.meterId,
							reading: current_invoice.invoice.endReading,
							time:current_invoice.invoice.closing
						});
						rt.closedByDebit=true;
					} else {
						rt.closedByDebit=false;
					}
					current_invoice.finalReading = rt;
					await ctx.call("debit.remove",{id:current_invoice._id});
					delete current_invoice._id;
					
					// We have to create a negative clearing as well
					let clearing = {
						meterId:current_invoice.meterId,
						reading:current_invoice.invoice.endReading
					}
					for (const [key, value] of Object.entries(current_invoice)) {
						if(key.indexOf('cost') == 0) {
							clearing[key] = (-1) * value;
						} 
						if(key.indexOf('consumption') == 0) {
							clearing[key] = (-1) * value;
						} 
					}

					await ctx.call("clearing.commit",{meterId:current_invoice.meterId});
					current_invoice.jwt = await ctx.call("access.createInvoiceJWT",current_invoice);
					return current_invoice;

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
