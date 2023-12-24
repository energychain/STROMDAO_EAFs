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
