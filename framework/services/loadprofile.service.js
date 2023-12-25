"use strict";
/**
 *  Model to derive load profiles for predictive and statistical use for meters
 */


const DbService = require("moleculer-db");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "loadprofile",
	
	adapter: process.db_adapter,
	
	collection: "loadprofile",

	mixins: [DbService],
	/**
	 * Settings
	 */
	settings: {
		fields: ["_id", "meterId", "epoch","epoch_of_day","day_of_week","month_of_year","label","consumption"],
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
				return await ctx.call("loadprofile.find",{search:ctx.params.q,searchFields:['meterId']});
			}
		},
		addSettlement: {
			rest: {
				method: "GET",
				path: "/assets"
			},
			params: {
				meterId: "string",
				epoch: "number",
				consumption: "number",
				label: "string"
			} ,
			async handler(ctx) {
				const EPOCH_DURATION = await ctx.call("tariff.epochDuration");
				const existsings = await ctx.call("loadprofile.find",{
					query: {
						meterId: ctx.params.meterId,
						epoch: ctx.params.epoch
					},
					limit: 1
				});

				const midnight = new Date(ctx.params.epoch * EPOCH_DURATION).setHours(0,0,0,0);
				let existing = {
					epoch: ctx.params.epoch,
					meterId: ctx.params.meterId,
					consumption:0,
					label: ctx.params.label,
					epoch_of_day: ctx.params.epoch - Math.floor(midnight / EPOCH_DURATION),
					day_of_week: new Date(ctx.params.epoch * EPOCH_DURATION).getDay(),
					month_of_year: new Date(ctx.params.epoch * EPOCH_DURATION).getMonth()
				};

				if(existsings.length > 0) {
					existing = existsings[0];
				}

				// apply new values
				existing.consumption += 1 * ctx.params.consumption;
				if((typeof existing._id !== 'undefined') || (typeof existing.id !== 'undefined')) {
					if(typeof existing._id !== 'undefined') existing.id = existing._id;
					await ctx.call("loadprofile.update",existing);
				} else {
					await ctx.call("loadprofile.insert",{entity:existing});
				}
				return;
			}
		},
		load: {
			rest: "/load",
			params: {
				meterId: {
					type: "string",
					optional:true
				}
			},
			openapi: {
				summary: "Statistical Load Profile of all or specific meter for a timeframe.",
				description: "Returns array of epochs with its consumption and total consumption in timeframe of given meterId or all if no meterId is given."
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				const EPOCH_DURATION = process.env.EPOCH_DURATION * 1;
				if((typeof ctx.params.start == 'undefined')  && (typeof ctx.params.end == 'undefined')) {
					ctx.params.end = 1 * Math.floor(new Date().setHours(0,0,0,0)/EPOCH_DURATION); 
					ctx.params.start = ctx.params.end - Math.floor(86400000 / EPOCH_DURATION);
				} else {
					if(typeof ctx.params.end == 'undefined') {
						ctx.params.end = (1 * ctx.params.start) + Math.floor(86400000 / EPOCH_DURATION);
					} else if(typeof ctx.params.start == 'undefined') {
						ctx.params.start = ctx.params.end - Math.floor(86400000 / EPOCH_DURATION);
					}
				}
				
				let query = {
					epoch: {
						$gte: 1 * ctx.params.start,
						$lte: 1 * ctx.params.end
					}
				}
				console.log(query);
				if(ctx.params.meterId) {
					query.meterId = ctx.params.meterId;
				}
				let historical = await ctx.call("loadprofile.find",{
					query: query,
					limit:10000,
					sort:"-epoch"
				});
				let sum = 0;
				let epoch_consumptions = {};

				for(let i=0;i<historical.length;i++) {
					if(typeof epoch_consumptions["epoch_"+historical[i].epoch] == 'undefined') {
						epoch_consumptions["epoch_"+historical[i].epoch] = {
							epoch:historical[i].epoch,
							epoch_of_day:historical[i].epoch_of_day,
							consumption:0
						}
					}
					epoch_consumptions["epoch_"+historical[i].epoch].consumption += Math.round(historical[i].consumption);
					sum += Math.round(historical[i].consumption);
				}	
				let epochs = [];
				for (const [key, value] of Object.entries(epoch_consumptions)) {
					epochs.push(value);
				}
				epochs = epochs.sort((a,b) => a.epoch - b.epoch);
				return {
					epochs:epochs,
					consumption:sum
				};
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
