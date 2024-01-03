"use strict";

/**
 * Processes an external meter reading and decorates with virtual meter points for subtariffs
 * 
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const ApiGateway = require("moleculer-web"); // Included for Invalid Authentication Errors 

/** @type {ServiceSchema} */
module.exports = {
	name: "metering",

	/**
	 * Settings
	 */


	/**
	 * Dependencies
	 */
	dependencies: [
		"readings"
	],

	/**
	 * Actions
	 */
	actions: {
		
		lastReading: {
			rest: {
				method: "GET",
				path: "/lastReading"
			},
			params: {
				meterId: "string"
			},
			openapi: {
				summary: "Last processed Reading of a Meter",
				description: "Allows to retrieve last meter reading with virtual meters of tariff segments.",
				responses: {
					200: {
						"description": "Last Reading",
						"content": {
						"application/json": {
							"schema": {
								"type": `object`,
								"properties": {
									"processed": { 
										type: `boolean`, 
										description: `If meter reading could be processed (if valid to updates)` ,
										example: true
									},
									"reading": { 
										type: `number`, 
										description: `Meter Reading in Wh` ,
										example: 1350
									}
								}
							},
							"example": {
								"meterId": "demo",
								"reading": 67589,
								"time": 1702135605721,
								"virtual_0": 910,
								"virtual_1": 688,
								"virtual_2": 222,
								"virtual_3": 0
							}
						},
						},
					},
				},
			},
			/**
			 * Retrieves the previous reading for a given meter ID.
			 *
			 * @param {Object} ctx - The context object.
			 * @return {Object|null} The previous reading object or null if not found.
			 */
			async handler(ctx) {
				if((typeof ctx.meta.user !== 'undefined') &&(typeof ctx.meta.user.meterId !== 'undefined')) {
					// Ensure Authenticated Token is authorized
					if(ctx.meta.user.meterId !== ctx.params.meterId) {
						throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
					}
				}
				const _previousReading = await ctx.call("readings_model.find",{
						query: {
							meterId: ctx.params.meterId
						}
					}
					);

				if(_previousReading.length == 1){
					delete _previousReading[0]._id;
					delete _previousReading[0].id;
					return _previousReading[0];
				} else {
					return null;
				}
			}
		},
		/**
		 * Main Action of service that processes an external meter reading and decorates with virtual meter points for subtariffs
		 *
		 * @returns
		 */
		updateReading: {
			rest: {
				method: "POST",
				path: "/updateReading"
			},
			openapi: {
				summary: "Update a meter reading",
				description: "Stores meter reading update and runs settlement on delta to last reading value. Does auto clearing in case enabled in `runtime.settings.js`.",
				responses: {
					200: {
						"description": "Processed information",
						"content": {
						"application/json": {
							"schema": {
								"type": `object`,
								"properties": {
									"processed": { 
										type: `boolean`, 
										description: `If meter reading could be processed (if valid to updates)` ,
										example: true
									},
									"reading": { 
										type: `number`, 
										description: `Meter Reading in Wh` ,
										example: 1350
									}
								}
							},
							"example": {
								"meterId": "demo",
								"reading": 67589,
								"time": 1702135605721,
								"virtual_0": 910,
								"virtual_1": 688,
								"virtual_2": 222,
								"virtual_3": 0,
								"processed": true
							}
						},
						},
					},
				},
			},
			params: {
				meterId: {
					type: "string",
					$$t: "Uniq ID of meter to be updated. Might be MeLoId",
					example: "demo"
				},
				time: { 
					type: "number",
					$$t: "Timestamp of meter reading given in partameter `reading` in UTC ms.",
					example: 1702217116620
				},
				reading: { 
					type: "number",
					$$t: "Actual reading in Wh at given time in parameter `time`",
					example: 833546123
				}
			},
			/**
			 * Handles updated meter readings:
			 * 	 - validation of values
			 *   - creation of transient reading
			 *   - settlement to virtual meter points
			 *   - consensus update for main meter
			 *
			 * @param {object} ctx - The context object containing the request information.
			 * @param {string} ctx.params.meterId - The ID of the meter.
			 * @param {number} ctx.params.time - The timestamp of the reading.
			 * @param {number} ctx.params.reading - The value of the reading.
			 * @return {object} transientReading - The updated transient reading object.
			 */
			async handler(ctx) {
				if((typeof ctx.meta.user !== 'undefined') && ((typeof ctx.meta.user.meterId !== 'undefined') || (typeof ctx.meta.user.concentratorId !== 'undefined'))) {
					// Ensure Authenticated Token is authorized
					if(typeof ctx.meta.user.concentratorId !== 'undefined') {
							// a Concentrator is a wildcard MPO allowed to update any meterId.
					} else {
						if(ctx.meta.user.meterId !== ctx.params.meterId) {
							throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
						}
					}
				}
				let _previousReading = await ctx.call("readings_model.find",{
						query: {
							meterId: ctx.params.meterId
						}
					}
				);
				ctx.params.time *= 1;
				ctx.params.reading  *= 1;
				
				let transientReading = {
					"meterId": ctx.params.meterId, 
					"reading":ctx.params.reading * 1,
					"time":ctx.params.time * 1,
					"virtual_0":0,
					"consumption":0,
					"processed":"tbd"
				}
				const labels = await ctx.call("tariff.customLabels");


				for (const [key, value] of Object.entries(labels)) {
					transientReading[key] = 0;
				}
				// test if we received a valid re-entry reading with a signed clearing token from us. 
				if(typeof ctx.params.clearing !== 'undefined') {
					if(typeof ctx.params.clearing.jwt !==  'undefined') {
						try {
							const trustedClearing = await ctx.call("access.verifySelf",{token:ctx.params.clearing.jwt});
							delete trustedClearing.exp;
							delete trustedClearing.iat;
							delete trustedClearing.aud;
							delete trustedClearing.sub;
							delete trustedClearing.iss;

							if(trustedClearing.meterId == ctx.params.meterId) {
								_previousReading = [trustedClearing];
							}

							_previousReading[0].time = trustedClearing.endTime;
						} catch(e) {
							console.error("Error verifying clearing token",e);
							delete ctx.params.clearing;
						}
					}
				}
				// Check if we know this meter by testing the length of the result (0 = not known, 1 = known)
				if(_previousReading.length == 0) {
					transientReading = await ctx.call("readings_model.insert",{entity:transientReading});
					transientReading.processed = true;
					transientReading.consumption = 0; // No consumption on first meter reading
				} else {
					transientReading = _previousReading[0];
					delete transientReading.processed;
					// Validate that we could update
					if( 
						(transientReading.time  < ctx.params.time)	&& // new reading needs to be newer than previous
						(transientReading.meterId == ctx.params.meterId) &&	// same meter
						(transientReading.reading <= ctx.params.reading)	// new reading needs to be higher than previous
					  ) {
						// Valid Reading to update transient virtual metering points
						const deltaConumption = ctx.params.reading - transientReading.reading;
						
						let tariff = [];
						// use tariff source if given in request and validate before					
						if(typeof ctx.params.tariff !== 'undefined') {
							for(let j=0;j<ctx.params.tariff.length;j++) {
								tariff.push(await ctx.call("access.verifySelf",{token:ctx.params.tariff[j].jwt}));
							}
						}
						
						const settlement = await ctx.call("settlement.retrieve",{
							consumption: deltaConumption,
							startTime: transientReading.time,
							endTime: ctx.params.time,
							meterId: ctx.params.meterId,
							injectedTariff: tariff // this is a trusted array as signature got validated before
						});

						transientReading.virtual_0 += 1 * deltaConumption;
						for (const [key, value] of Object.entries(settlement)) {
							if((typeof transientReading[key] == "undefined") || (transientReading[key] == null)) {
								transientReading[key] = 0;
							}
							transientReading[key] += 1 * value; 
							transientReading['consumption_'+key] = 1 * value; 
						}

						transientReading.reading = ctx.params.reading * 1;
						transientReading.time = ctx.params.time * 1;
						transientReading.id = transientReading._id;
						transientReading.jwt = await ctx.call("access.createReadingJWT",transientReading);
						if(typeof ctx.params.clearing !== 'undefined') {
							// in case we received a clearing we might need to insert first
							const findExisting = await ctx.call("readings_model.find",{
								query: {
									meterId: ctx.params.meterId
								}
							});
							if(findExisting.length == 0) {
								await ctx.call("readings_model.insert",{entity:transientReading});
							} else {
								for(let i=0;i<findExisting.length;i++) {
									try {
										await ctx.call("readings_model.remove",{id:findExisting[i]._id});
									} catch(e) {
										console.error("Error removing transient reading",e);
									} 
								}
								await ctx.call("readings_model.insert",{entity:transientReading});
							}
						} else {
							await ctx.call("readings_model.update",transientReading);
						}
						transientReading.consumption = deltaConumption;
						delete transientReading.id;
						transientReading.processed = true;
					  } else {
						// Invalid transient reading - do not update
						transientReading.processed = false;
						if(transientReading.time  > ctx.params.time) transientReading.debug = "time";
						if(transientReading.meterId != ctx.params.meterId) transientReading.debug = "meterId";
						if(transientReading.reading > ctx.params.reading) transientReading.debug = "reading";
					  }
				}

				if((transientReading.processed) && (process.env.AUTO_CLEARING)) {
					transientReading.endTime = transientReading.time;
					const transientClearing = {
						"meterId": transientReading.meterId, 
						"reading":transientReading.reading,
						"endTime":transientReading.time,
						"consumption":transientReading.consumption,
					}
					for (const [key, value] of Object.entries(transientReading)) {
						if((key.indexOf('virtual_') == 0) || (key.indexOf('consumption_') == 0 )) {
							transientClearing[key] = value;
						}
					}

					let clearing = await ctx.call("clearing.commit",transientClearing);
					
					transientReading.id = transientReading._id;
					if(typeof transientReading._id !== 'undefined') {
						transientReading.clearingJWT = clearing.jwt;
						delete transientReading._id;
						await ctx.call("readings_model.update",{id:transientReading.id,clearingJWT:transientReading.clearingJWT}); // ensures clearing to be part of.
					}
				}
				delete transientReading._id; // For operational safety we do not provide our db IDs to the client.
				delete transientReading.id;
				if(transientReading.processed) {
					await ctx.broker.emit("reading.processed", transientReading);
				}
				return transientReading;
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
