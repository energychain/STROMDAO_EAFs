"use strict";

/**
 * Use this service to integrate a single action in development. Move it to a service in production by adding this method to a service in ./services/ 
 * 
 * 
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "integration",

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

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
