"use strict";
/**
 *  Service to do http pull requests to fetch meter readings from external REST APIs
 */

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
const ApiGateway = require("moleculer-web"); // Included for Invalid Authentication Errors 
const axios = require("axios");


/** @type {ServiceSchema} */
module.exports = {
	name: "httppull",

	/**
	 * Dependencies
	 */
	dependencies: ["httppull_model"],

	/**
	 * Actions
	 */
	actions: {

		fetch: {
			rest: {
				method: "GET",
				path: "/fetch"
			},
			params: {
				requestId: {
					type: "string",
					required: true
				}
			},
			async handler(ctx) {
				if((typeof ctx.meta.user !== 'undefined') && (typeof ctx.meta.user.meterId !== 'undefined')) {
					// Ensure Authenticated Token is authorized
					if(ctx.meta.user.meterId !== ctx.params.meterId) {
						throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
					}
				}
				let results =  await ctx.call("clearings_model.find",{
					query: {
						meterId: ctx.params.meterId
					},
					sort:"-epoch"
				});
				
				return results;
			}
		},
		process: {
			rest: {
				method: "GET",
				path: "/fetch"
			},
			params: {
				requestId: {
					type: "string",
					required: true
				}
			},
			async handler(ctx) {
				if((typeof ctx.meta.user !== 'undefined') && (typeof ctx.meta.user.meterId !== 'undefined')) {
					// Ensure Authenticated Token is authorized
					if(ctx.meta.user.meterId !== ctx.params.meterId) {
						throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
					}
				}
				let results =  await ctx.call("clearings_model.find",{
					query: {
						meterId: ctx.params.meterId
					},
					sort:"-epoch"
				});
				
				return results;
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
