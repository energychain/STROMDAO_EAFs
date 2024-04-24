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
let db;

/** @type {ServiceSchema} */
module.exports = {
	name: "powerfox",

	/**
	 * Dependencies
	 */
	dependencies: ["httppull_model"],

	/**
	 * Actions
	 */
	actions: {

		login: {
			rest: {
				method: "POST",
				path: "/login"
			},
			async handler(ctx) {
				const textLoginResp = await axios.get("https://backend.powerfox.energy/api/2/my/all/devices",{
					auth: {
						username: ctx.params.email,
						password: ctx.params.password
					  }
				});
			
				let mainDeviceId = null;
				for(let i=0;i<textLoginResp.data.length;i++) {
					if(textLoginResp.data[i].mainDevice) {
						mainDeviceId = textLoginResp.data[i].deviceId;
					}
				}
				console.log("Selected Primar PowerFox",mainDeviceId);
				if(mainDeviceId !== null) {
					let meterId = "powerfox_"+mainDeviceId;
					ctx.meta.user = { meterId: meterId };
					// Create a valid access token
					let token = await ctx.call("access.createMeterJWT",{ meterId: meterId });
					ctx.meta.auth = token;
					// Insert Values into Database or update
					
					let httppull = await db.collection("httppull");
					await httppull.updateOne({ "meterId": meterId } , {
						"$set": {
							"requestId" : meterId,
							"fetch" : {
								"url" : "https://backend.powerfox.energy/api/2/my/"+mainDeviceId+"/current?unit=wh",
								"method" : "GET",
								"auth" : {
									"username" : ctx.params.email,
									"password" : ctx.params.password
								}
							},
							"processor" : {
								"reading" : "{{json.a_Plus}}",
								"timestamp" : "{{json.timestamp}}",
								"meterId" : meterId
							},
							"updated" : new Date().getTime(),
							"meterId" : meterId
						}
					}, { upsert:true});
					try {
						
						ctx.call("httppull.updateReading",{meterId: meterId});
					} catch(e) {

					}
					
					return { token: token,meterId: meterId};
				} else {
					return { err: "login failed"};
				}	
			}
		},
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

		if((typeof process.env.db_adapter !=='undefined')&&(process.env.db_adapter !== null)&&(process.env.db_adapter !== 'null')) {
			const { MongoClient } = require("mongodb");
			const client = new MongoClient(process.env.db_adapter);
			await client.connect();
			db = client.db('stromdao_eafs');
		} else {
			console.log("Powerfox Service enabled but no db adapter configured");
		}
	},


	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
