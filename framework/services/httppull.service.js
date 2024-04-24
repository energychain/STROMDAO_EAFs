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
				let results =  await ctx.call("httppull_model.find",{
					query: {
						requestId: ctx.params.requestId
					}
				});
				if((typeof results !== 'undefined') && (results !== null) && (results.length == 1)) {
					const res = await axios(results[0].fetch);
					return res.data;
				} else return null;
				
			}
		},
		process: {
			rest: {
				method: "GET",
				path: "/process"
			},
			params: {
				requestId: {
					type: "string",
					required: true
				}
			},
			async handler(ctx) {
				try {
					let json = await ctx.call("httppull.fetch",{requestId:ctx.params.requestId});
					if(json !== null) {
						const results =  await ctx.call("httppull_model.find",{
							query: {
								requestId: ctx.params.requestId
							}
						});
						const rule = results[0].processor;
						const Handlebars = require('handlebars');

						function convertObject(obj, rulesTemplate) {
							const template = Handlebars.compile(JSON.stringify(rulesTemplate));
							const context = { json: obj };
							const convertedData = JSON.parse(template(context));
							return convertedData;
						} 		
						
						return convertObject(json, rule);
					} else return null;
				} catch(e) {
					return null;
				}
			}
		},
		updateReading: {
			rest: {
				method: "GET",
				path: "/updateReading"
			},
			async handler(ctx) {
				const results =  await ctx.call("httppull_model.find",{
					query: {
						meterId: ctx.params.meterId
					}
				});
				let json = await ctx.call("httppull.process",{requestId:results[0].requestId});
				if(json !== null) {
					json.meterId = results[0].meterId;
					json.reading *= 1;
					json.timestamp *= 1000; //TODO:  Fix should be done in Template not in code
					return await ctx.call("metering.updateReading",json); 
				} else return {};
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
