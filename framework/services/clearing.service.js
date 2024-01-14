"use strict";
/**
 *  Service to do actual clearing (invoicing of consumption over time)
 */

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
const ApiGateway = require("moleculer-web"); // Included for Invalid Authentication Errors 

/** @type {ServiceSchema} */
module.exports = {
	name: "clearing",

	/**
	 * Dependencies
	 */
	dependencies: ["clearings_model"],

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
				return await ctx.call("clearings_model.find",{search:ctx.params.q,searchFields:['meterId'],sort:"-clearingTime"});
			}
		},
		retrieve: {
			rest: {
				method: "GET",
				path: "/retrieve"
			},
			params: {
				meterId: {
					type: "string",
					required: true
				}
			},
			async handler(ctx) {
				if((typeof ctx.meta.user !== 'undefined') && (typeof ctx.meta.user.meterId !== 'undefined')) {
					// Ensure Authenticated Token is authorized
					if(ctx.meta.user.meterId !== ctx.params.meterId) {
						throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
					}
				}
				let results =  await ctx.call("clearings_model.find",{
					query: {
						meterId: ctx.params.meterId
					},
					sort:"-epoch"
				});
				let labels = await ctx.call("tariff.customLabels");
				for(let i=0;i<results.length;i++) {
					for(const [key, value] of Object.entries(labels)) {
						if(typeof results[i][key] == 'undefined') {
							results[i][key] = 0
						}
						if(typeof results[i]["consumption_"+key] == 'undefined') {
							results[i]['consumption_'+key] = 0
						}
					}
				}
				results.sort((a,b) => b.startTime - a.startTime);
				if(results.length > 200) {
					results = results.slice(0,200); // TODO add pageing
				}
				return results;
			}
		},
		/**
		 * Commit a readings of a meterId to run clearing.
		 *
		 * @returns
		 */
		commit: {
			rest: {
				method: "POST",
				path: "/commit"
			},
			params: {
				meterId: {
					type: "string",
					required: true
				},
				endTime: {
					type: "number",
					required: true
				},
				consumption: {
					type: "number",
					required: true
				},
				reading: {
					type: "number",
					required: true
				}
			},
			async handler(ctx) {
				ctx.params.processed= false;
				ctx.params.epoch = Math.floor(ctx.params.endTime / process.env.EPOCH_DURATION);
				// Check if previous clearing exists for given meter
				let previousClearings = await ctx.call("clearings_model.find",{
					query: {
						meterId: ctx.params.meterId
					},
					sort: "-epoch"
				});
				ctx.params.clearingTime = new Date().getTime();
				
				if( 
					(ctx.params.consumption >= 0)
				) {
						if(previousClearings.length == 0) {	
							ctx.params.jwt = await ctx.call("access.createClearingJWT",ctx.params);
							ctx.params.processed = true;
							await ctx.call("clearings_model.insert",{entity:ctx.params});
						} else {
							// Validate basic characteristics of clearing
							let previousClearing = previousClearings[0];
							if(
									(previousClearing.epoch <= ctx.params.epoch) &&
								    (previousClearing.reading <= ctx.params.reading) 		
							) {
								


								// Apply Price Info to Clearance
								let prices = await ctx.call("tariff.getPrices",{
									epoch: ctx.params.epoch
								});

								// In case of a price change we need to invoice (cloase debit) before processing



								let totalCost = 0;

								for (let [key, value] of Object.entries(prices)) {
									if((value == null)||(isNaN(value))) value = 0;
									if(
										(typeof ctx.params["consumption_"+key] == 'undefined') ||
										(ctx.params["consumption_"+key] == null)
									) { ctx.params["consumption_"+key] = 0; }
								
									const epochCost = (ctx.params["consumption_"+key]/1000) * value;
									totalCost += 1 * epochCost; 
									ctx.params["cost_"+key] = epochCost;
								}
								ctx.params["cost"] = totalCost;
								
								ctx.params.processed = true;
								ctx.params.jwt = await ctx.call("access.createClearingJWT",ctx.params);
								ctx.params.startReading = previousClearing.reading;
								ctx.params.startTime = previousClearing.endTime + 1; 
								await ctx.call("clearings_model.insert",{entity:ctx.params});
								await ctx.broker.broadcast("clearing.created", ctx.params);
								if(ctx.params.cost > 0) {
									// If cost < 0 it would be a credit 
									await ctx.call("debit.add",ctx.params);
								} 
								if((previousClearing.epoch < prices.fromEpoch) && (ctx.params.cost > 0)) {
									await ctx.call("debit.closeBilling",{meterId:ctx.params.meterId});
								}
							} 
						}
				}
				return ctx.params;
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
