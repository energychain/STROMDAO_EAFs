"use strict";
/**
 *  Model to work with access tokens in Automated Meter Reading operations
 */
const jwt = require("jsonwebtoken");

const DbService = require("moleculer-db");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "access",
	
	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		createMeterJWT: {
			rest: {
				method: "GET",
				path: "/createJWT"
			},
			params: {
				meterId: {
					type:"string"
				}
			},
			async handler(ctx) {
				const token = jwt.sign({
					meterId: ctx.params.meterId 
				  }, require("../runtime.settings.js").JWT_SECRET,{expiresIn: require("../runtime.settings.js").JWT_EXPIRE_METERING});
				return token;
			}
		},
		createReadingJWT: {
			rest: {
				method: "GET",
				path: "/createReadingJWT"
			},
			params: {
				meterId: {
					type:"string"
				},
				reading: {
					type:"number"
				},
				time: {
					type: "number"
				}
			},
			async handler(ctx) {
				const token = jwt.sign(ctx.params, require("../runtime.settings.js").JWT_SECRET,{expiresIn: require("../runtime.settings.js").JWT_EXPIRE_READING});
				return token;
			}
		},
		createClearingJWT: {
			rest: {
				method: "GET",
				path: "/createClearingJWT"
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
				},
				clearingTime: {
					type: "number",
					required: true
				},
			},
			async handler(ctx) {
				const token = jwt.sign(ctx.params, require("../runtime.settings.js").JWT_SECRET,{expiresIn: require("../runtime.settings.js").JWT_EXPIRE_CLEARING});
				return token;
			}
		},
		/*
			Returns payload data of a Json-Web-Token created using this service.
		*/
		retrieveJWT: {
			rest: {
				method: "GET",
				path: "/retrieveJWT"
			},
			params: {
				token: {
					type:"string"
				}
			},
			async handler(ctx) {
				const token = jwt.verify(ctx.params.token, require("../runtime.settings.js").JWT_SECRET);
				return token;
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
