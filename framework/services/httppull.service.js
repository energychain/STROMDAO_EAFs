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
const Cron = require("moleculer-cron");

/** @type {ServiceSchema} */
module.exports = {
	name: "httppull",
	mixins: [Cron],

	/**
	 * Dependencies
	 */
	dependencies: ["httppull_model"],

	crons: [
        {
            name: "Scheduled HTTP Pulls",
            cronTime: '*/5 * * * *',
            manualStart: false,
            timeZone: 'Europe/Berlin',
            onTick: async function(ctx) {
			  console.log("Scheduled Fetch triggered");
              await ctx.call("httppull.scheduledFetch");
            },
            runOnInit: function() {
          	},
            onComplete: function() {
            }
        }
	],
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
						results[0].lastFetch = new Date().getTime();
						results[0].id = results[0]._id;
						await ctx.call("httppull_model.update",results[0]);

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
		scheduledFetch: {
			rest: {
				method: "GET",
				path: "/scheduledFetch"
			},
			async handler(ctx) {
				const results =  await ctx.call("httppull_model.find",{
					$or: [
						{lastFetch: { $exists: false }},
						{lastFetch: { $gt: new Date().getTime() - 86400000 }}
					]
				});
				let res = [];
				for(let i=0;i<results.length;i++) {
					res.push(await ctx.call("httppull.updateReading",{meterId:results[i].meterId},{timeout:60000}));
				}
				return res;
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
				let json = await ctx.call("httppull.process",{requestId:results[0].requestId},{timeout:60000});
				if(json !== null) {
					json.meterId = results[0].meterId;
					json.reading *= 1;
					json.timestamp *= 1000; //TODO:  Fix should be done in Template not in code
					return await ctx.call("metering.updateReading",json,{timeout:60000}); 
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
