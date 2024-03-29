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
		settings: {
			openapi: {
				summary: "Retrieve settings for example for client configuration."
			},
			rest: {
				method: "GET",
				path: "/settings"
			},
			async handler(ctx) {
				let SINGLE_NODE = true;
				if((typeof process.env["TRANSPORTER"] !== 'undefined')&&(process.env["TRANSPORTER"] !== 'null')) { 
					SINGLE_NODE = false;
				}
				let STATELESS_MODE = true;
				if((typeof process.env["db_adapter"] !== 'undefined')&&(process.env["db_adapter"] !== 'null')) { 
					STATELESS_MODE = false;
				}
				return {
					EPOCH_DURATION: process.env.EPOCH_DURATION,
					PORT_PWA: process.env.PORT_PWA,
					PWA_URL: process.env.PWA_URL,
					METERING_URL: process.env.METERING_URL,
					PORT_METERING: process.env.PORT_METERING,
					TARIFF_SEGMENTS: process.env.TARIFF_SEGMENTS,
					JWT_EXPIRE_METERING: process.env.JWT_EXPIRE_METERING,
					SINGLE_NODE: SINGLE_NODE,
					STATELESS_MODE: STATELESS_MODE
				}
			}
		},
		publicKey: {
			openapi: {
				summary: "Retrieve public key of this instance."
			},
			rest: {
				method: "GET",
				path: "/publicKey"
			},
			async handler(ctx) {
				const verifyOptions = JSON.parse(process.env.JWT_OPTIONS);
				verifyOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				return {publicKey:"" + process.env.JWT_PUBLICKEY,options:verifyOptions}
			}
		},
		refresh: {
			openapi: {
				summary: "Allows to refresh JWT of a metering token (extend time to expiration)"
			},
			rest: {
				method: "GET",
				path: "/refresh"
			},
			params: {
				token: {
					type:"string"
				},
				meterId: {
					type:"string"
				}
			},
			async handler(ctx) {
				const verificationExisting = await ctx.call("access.verifySelf",ctx.params);
				if(typeof verificationExisting.concentratorId !== 'undefined') {
					const token = await ctx.call("access.createConcentratorJWT",{
						concentratorId:verificationExisting.concentratorId
					});
					return {
							token:token
					};
				} else {
					if(
						(verificationExisting.meterId == ctx.params.meterId)
					) {
						const token = await ctx.call("access.createMeterJWT",ctx.params);
						return {
							token:token
						};
					} else {
						throw new Error("Invalid token");
					}
				}
			}
		},
		createMeterActivationCode: {
			openapi: {
				summary: "Creates pre shared activation code for given meter"
			},
			rest: {
				method: "GET",
				path: "/createMeterActivationCode"
			},
			params: {
				meterId: {
					type:"string",
					$$t: "MeterId of the meter to create activation code for"
				}
			},
			async handler(ctx) {
				let results = await ctx.call("clientactivation.find",{query:{
					meterId:ctx.params.meterId
				}});
				for(let i=0;i<results.length;i++) {
					await ctx.call("clientactivation.remove",{id:results[i]._id});
				}
					
				let reactivationSecret = await ctx.call("access.randomString",{length:12});

				await ctx.call("clientactivation.insert",{entity:{
					meterId:ctx.params.meterId,
					activationSecret:reactivationSecret
				}});

				const token = await ctx.call("access.createMeterJWT",ctx.params);
				return {
					token:token,
					activationSecret:reactivationSecret
				};
			}
		},
		createMeterJWT: {
			openapi: {
				summary: "Create Token to authorize external reading updates of meter"
			},
			rest: {
				method: "GET",
				path: "/createMeterJWT"
			},
			params: {
				meterId: {
					type:"string",
					$$t: "MeterId of the meter to authorize reading updates for"
				}
			},
			async handler(ctx) {
				const signOptions = JSON.parse(process.env.JWT_OPTIONS);
				signOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				const token = jwt.sign({
					meterId: ctx.params.meterId 
				  }, process.env.JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		demo: {
			openapi: {
				summary: "Create Token to authorize with demo user"
			},
			rest: {
				method: "GET",
				path: "/demo"
			},
			params: {
			},
			async handler(ctx) {
				const signOptions = JSON.parse(process.env.JWT_OPTIONS);
				signOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				const token = jwt.sign({
					meterId: 'demo' 
				  }, process.env.JWT_PRIVATEKEY,signOptions);
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
				const signOptions = JSON.parse(process.env.JWT_OPTIONS);
				signOptions.expiresIn = process.env.JWT_EXPIRE_READING;
				const token = jwt.sign(ctx.params, process.env.JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		createConcentratorJWT: {
			openapi: {
				summary: "Create wildcard Token to authorize external reading updates of meter"
			},
			rest: {
				method: "POST",
				path: "/createConcentratorJWT"
			},
			params: {
				concentratorId: {
					type:"string",
					$$t: "ConcentratorId to authorize wildcard reading updates for"
				}
			},
			async handler(ctx) {
				const signOptions = JSON.parse(process.env.JWT_OPTIONS);
				signOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				const token = jwt.sign({
					concentratorId: ctx.params.concentratorId 
				  }, process.env.JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		randomString: {
			rest: {
				method: "GET",
				path: "/randomString"
			},
			openapi: {
				summary: "Creates a random String of given length."
			},
			params: {
				length: {
					type:"number"
				}
			},
			async handler(ctx) {
				const allowedChars = '123456789QWERTZUPASDFGHJKYXCVBNM*#!§&qwertzupasdfghjklyxcvbnm';
				let randomString = '';
			  
				for (let i = 0; i < ctx.params.length; i++) {
				  const randomIndex = Math.floor(Math.random() * allowedChars.length);
				  randomString += allowedChars.charAt(randomIndex);
				}
			  
				return randomString;
			}
		},
		/*
		* Allows activation of  a meter reading client with a code (pre shared secred).
		* Returns token to be used for a meter reading update and new activation secret		
		 */ 
		activation: {
			rest: {
				method: "POST",
				path: "/activiation"
			},
			openapi: {
				summary: "Provides update token for automated meter readings."
			},
			params: {
				activationSecret: {
					type:"string"
				},
				meterId: {
					type:"string"
				}
			},
			async handler(ctx) {
				let results = await ctx.call("clientactivation.find",{query:{
					activationSecret:ctx.params.activationSecret,
					meterId:ctx.params.meterId
				}});
				if(results.length == 1) {
					let reactivationSecret = ctx.params.activationSecret;
					
					if(process.env.ACTIVATIONMULTIUSE !== "true") {
						await ctx.call("clientactivation.remove",{id:results[0]._id});
						reactivationSecret = await ctx.call("access.randomString",{length:12});

						await ctx.call("clientactivation.insert",{entity:{
							meterId:ctx.params.meterId,
							activationSecret:reactivationSecret
						}});	
					}

					let token = await ctx.call("access.createMeterJWT",ctx.params);
					return {
						token:token,
						activationSecret:reactivationSecret
					};
				} else {
					throw new Error("Activation failed");
				}
			}
		},
		createTariffJWT: {
			rest: {
				method: "GET",
				path: "/createTariffJWT"
			},
			openapi: {
				summary: "Create Token to verify tariff labels of this instance."
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
				const signOptions = JSON.parse(process.env.JWT_OPTIONS);
				signOptions.expiresIn = process.env.JWT_EXPIRE_READING;
				const token = jwt.sign(ctx.params, process.env.JWT_PRIVATEKEY,signOptions);
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
				const signOptions = JSON.parse(process.env.JWT_OPTIONS);
				signOptions.expiresIn = process.env.JWT_EXPIRE_CLEARING;
				const token = jwt.sign(ctx.params, process.env.JWT_PRIVATEKEY,signOptions);
				return token;
			}
		},
		createInvoiceJWT: {
			rest: {
				method: "GET",
				path: "/createInvoiceJWT"
			},
			openapi: {
				summary: "Create Token to verify invoices of this instance."
			},
			params: {
				meterId: {
					type: "string",
					required: true
				}
			},
			async handler(ctx) {
				const signOptions = JSON.parse(process.env.JWT_OPTIONS);
				signOptions.expiresIn = process.env.JWT_EXPIRE_CLEARING;
				const token = jwt.sign(ctx.params, process.env.JWT_PRIVATEKEY,signOptions);
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
				const verifyOptions = JSON.parse(process.env.JWT_OPTIONS);
				verifyOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				const token = jwt.verify(ctx.params.token,process.env.JWT_PUBLICKEY, verifyOptions);
				return token;
			}
		},
		updateAssetMeta: {
			rest: {
				method: "POST",
				path: "/updateAssetMeta"
			},
			openapi: {
				summary: "Update client specific asset meta data.",
				description: "Use dot notation for nested fields (sub documents)"
			},
			params: {
				token: {
					type:"string"
				},
				meterId: {
					type:"string"
				}
			},
			async handler(ctx) {
				const verifyOptions = JSON.parse(process.env.JWT_OPTIONS);
				verifyOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				const token = jwt.verify(ctx.params.token,process.env.JWT_PUBLICKEY, verifyOptions);
				delete ctx.params.token;
				let updateObject = {
					assetId:ctx.params.meterId,
					type:'meter'
				};
				for (const [key, value] of Object.entries(ctx.params)) {
					updateObject["clientMeta."+key] = value;
				}
				return await ctx.call("asset.upsert",updateObject);
			}
		},
		sharedFolder: {
			rest: {
				method: "GET",
				path: "/sharedFolder"
			},
			params: {
				token: {
					type:"string"
				}
			},
			async handler(ctx) {
				const verifyOptions = JSON.parse(process.env.JWT_OPTIONS);
				verifyOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				const token = jwt.verify(ctx.params.token,process.env.JWT_PUBLICKEY, verifyOptions);
				delete ctx.params.token;
				
				await ctx.call("nextcloud.createAssetShare",{assetId:token.meterId,assetType:'meter'});
				const result = await ctx.call("asset.get",{assetId:token.meterId,type:'meter'});
				return result.nextcloud;
			}
		},
		getAssetMeta: {
			rest: {
				method: "GET",
				path: "/getAssetMeta"
			},
			openapi: {
				summary: "Retrieve Metadata of client specific asset."
			},
			params: {
				token: {
					type:"string"
				}
			},
			async handler(ctx) {
				const verifyOptions = JSON.parse(process.env.JWT_OPTIONS);
				verifyOptions.expiresIn = process.env.JWT_EXPIRE_METERING;
				const token = jwt.verify(ctx.params.token,process.env.JWT_PUBLICKEY, verifyOptions);
				delete ctx.params.token;
				const meter = await ctx.call("asset.get",{assetId:token.meterId,type:'meter'}); 
				const balance = await ctx.call("asset.get",{assetId:token.meterId,type:'balance'}); 
				const debit = await ctx.call("asset.get",{assetId:token.meterId,type:'debit'}); // 
				let result = {};
				for(const [key, value] of Object.entries(meter)) { result[key] = value; }
				for(const [key, value] of Object.entries(balance)) { result[key] = value; }
				for(const [key, value] of Object.entries(debit)) { result[key] = value; }

				return result;
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
