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
	name: "debit_model",
	
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
				return await ctx.call("clearings_model.find",{search:ctx.params.q,searchFields:['meterId']});
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
