"use strict";
/**
 *  Model to work with one reading per Meter
 */


const DbService = require("moleculer-db");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "balance_settlements_late_model",
	
	adapter: process.db_adapter,
	
	collection: "balance_settlements_late",

	mixins: [DbService],
	/**
	 * Settings
	 */
	settings: {
		fields: ["_id", "from", "to","epoch","label","energy","co2eq"]
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
				return await ctx.call("readings_model.find",{search:ctx.params.q,searchFields:['meterId']});
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
