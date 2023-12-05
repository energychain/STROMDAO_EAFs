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
	name: "readings",

	mixins: [DbService],
	/**
	 * Settings
	 */
	settings: {
		fields: ["_id", "meterId", "reading","time","virtual_0","virtual_1","virtual_2","virtual_3","virtual_4","virtual_5","virtual_6","virtual_7","virtual_8","virtual_9"],
   },

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		

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
