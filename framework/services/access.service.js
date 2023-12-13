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
		publicKey: {
			openapi: {
				summary: "Retrieve public key of this instance."
			},
			rest: {
				method: "GET",
				path: "/publicKey"
			},
			async handler(ctx) {
				return {publicKey:"" + require("../runtime.settings.js").JWT_PUBLICKEY}
			}
		},
		createMeterJWT: {
			openapi: {
				summary: "Create Token to authorize external reading updates of meter"
			},
			rest: {
				method: "GET",
				path: "/createJWT"
			},
			params: {
				meterId: {
					type:"string",
					$$t: "MeterId of the meter to authorize reading updates for"
				}
			},
			async handler(ctx) {
				const signOptions = require("../runtime.settings.js").JWT_OPTIONS;
				signOptions.expiresIn = require("../runtime.settings.js").JWT_EXPIRE_METERING;
				const token = jwt.sign({
					meterId: ctx.params.meterId 
				  }, require("../runtime.settings.js").JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		demo: {
			openapi: {
				summary: "Create Token to authorize with demo user"
			},
			rest: {
				method: "GET",
				path: "/createJWT"
			},
			params: {
			},
			async handler(ctx) {
				const signOptions = require("../runtime.settings.js").JWT_OPTIONS;
				signOptions.expiresIn = require("../runtime.settings.js").JWT_EXPIRE_METERING;
				const token = jwt.sign({
					meterId: 'demo' 
				  }, require("../runtime.settings.js").JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		createReadingJWT: {
			rest: {
				method: "GET",
				path: "/createReadingJWT"
			},
			openapi: {
				summary: "Create Token to verify reading updates of this instance."
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
				const signOptions = require("../runtime.settings.js").JWT_OPTIONS;
				signOptions.expiresIn = require("../runtime.settings.js").JWT_EXPIRE_READING;
				const token = jwt.sign(ctx.params, require("../runtime.settings.js").JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		createTariffJWT: {
			rest: {
				method: "GET",
				path: "/createTariffJWT"
			},
			openapi: {
				summary: "Create Token to verify tariff labelsof this instance."
			},
			params: {
				price: {
					type:"number"

				},
				label: {
					type:"string"
				},
				epoch: {
					type:"number"
				},
				time: {
					type: "number"
				}
			},
			async handler(ctx) {
				const signOptions = require("../runtime.settings.js").JWT_OPTIONS;
				signOptions.expiresIn = require("../runtime.settings.js").JWT_EXPIRE_READING;
				const token = jwt.sign(ctx.params, require("../runtime.settings.js").JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		createClearingJWT: {
			rest: {
				method: "GET",
				path: "/createClearingJWT"
			},
			openapi: {
				summary: "Create Token to verify clearings of this instance."
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
				const signOptions = require("../runtime.settings.js").JWT_OPTIONS;
				signOptions.expiresIn = require("../runtime.settings.js").JWT_EXPIRE_CLEARING;
				const token = jwt.sign(ctx.params, require("../runtime.settings.js").JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		/*
			Returns payload data of a Json-Web-Token created using this service.
		*/
		verifySelf: {
			rest: {
				method: "GET",
				path: "/verifySelf"
			},
			openapi: {
				summary: "Verify signing token is this instance."
			},
			params: {
				token: {
					type:"string"
				}
			},
			async handler(ctx) {
				const verifyOptions = require("../runtime.settings.js").JWT_OPTIONS;
				verifyOptions.expiresIn = require("../runtime.settings.js").JWT_EXPIRE_METERING;
				const token = jwt.verify(ctx.params.token,require("../runtime.settings.js").JWT_PUBLICKEY, verifyOptions);
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
