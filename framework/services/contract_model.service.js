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
	name: "contract_model",
	
	adapter: process.db_adapter,
	
	collection: "contract",

	mixins: [DbService],
	/**
	 * Settings
	 */
	settings: {
		fields: ["_id", "assetId", "contractId","updated","partnerId","direction","load_min","load_max","energy","balanced","fulfillment","status","lastClearedEpoch"]	   
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
