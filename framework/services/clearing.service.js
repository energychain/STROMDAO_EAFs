"use strict";
/**
 *  Service to do actual clearing (invoicing of consumption over time)
 */
const DbService = require("moleculer-db");
/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
const EPOCH_DURATION =  require("../runtime.settings.js").EPOCH_DURATION; // Defines how long an Epoch is.

/** @type {ServiceSchema} */
module.exports = {
	name: "clearing",

	mixins: [DbService],
	
	adapter: require("../runtime.settings.js").db_adapter,
	
	collection: "clearing",

	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

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
				let results =  await ctx.call("clearing.find",{
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
				results.sort((a,b) => b.endTime - a.endTime);
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
				ctx.params.epoch = Math.floor(ctx.params.endTime / EPOCH_DURATION);
				// Check if previous clearing exists for given meter
				let previousClearings = await ctx.call("clearing.find",{
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
							await ctx.call("clearing.insert",{entity:ctx.params});
							ctx.params.processed = true;
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
								let totalCost = 0;

								for (let [key, value] of Object.entries(prices)) {
									if(value == null) value = 0;
									if(typeof ctx.params["consumption_"+key] == 'undefined') ctx.params["consumption_"+key] = 0;
									const epochCost = (ctx.params["consumption_"+key]/1000) * value;
									totalCost += 1 * epochCost; 
									ctx.params["cost_"+key] = epochCost;
								}
								ctx.params["cost"] = totalCost;
								ctx.params.processed = true;
								await ctx.call("clearing.insert",{entity:ctx.params});
								
								// TODO validate virtual readings
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
