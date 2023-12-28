"use strict";

/**
 * Meta Data Management for assets like meters, clients, etc... 
 * This service is only available for statefull (with mongodb) instances of the framework.
 * 
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
let db;

/** @type {ServiceSchema} */
module.exports = {
	name: "asset",

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
		test: {
			rest: "/test",
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
				ctx.broker.emit("settlement.created", {});
			}
		},
	},

	/**
	 * Events
	 */
	events: {
		"settlement.created": {
            // Force to use context based signature
            context: true,
            async handler(other) {
                console.log(`${this.broker.nodeID}:${this.fullName}: Event '${other.eventName}' received. Payload:`, other.params, other.meta);
            }
        }
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

		if((typeof process.env.db_adapter !=='undefined')&&(process.env.db_adapter !== null)&&(process.env.db_adapter !== 'null')) {
			const { MongoClient } = require("mongodb");
			const client = new MongoClient(process.env.db_adapter);
			await client.connect();
			db = client.db('stromdao_eafs');
		} else {
			console.log("Asset Service enabled but no db adapter configured");
		}
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
