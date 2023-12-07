"use strict";

/**
 * Processes an external meter reading and decorates with virtual meter points for subtariffs
 * 
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

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
			/**
			 * Retrieves the previous reading for a given meter ID.
			 *
			 * @param {Object} ctx - The context object.
			 * @return {Object|null} The previous reading object or null if not found.
			 */
			async handler(ctx) {
				const _previousReading = await ctx.call("readings.find",{
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
			params: {
				meterId: "string",
				time: { type: "number"},
				reading: { type: "number"}
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
				const _previousReading = await ctx.call("readings.find",{
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
					"virtual_1":0,
					"virtual_2":0
				}

				// Check if we know this meter by testing the length of the result (0 = not known, 1 = known)
				if(_previousReading.length == 0) {
					transientReading = await ctx.call("readings.insert",{entity:transientReading});
					transientReading.processed = true;
				} else {
					transientReading = _previousReading[0];
			
					// Validate that we could update
					if( 
						(transientReading.time  < ctx.params.time)	&& // new reading needs to be newer than previous
						(transientReading.meterId == ctx.params.meterId) &&	// same meter
						(transientReading.reading < ctx.params.reading)	// new reading needs to be higher than previous
					  ) {
						// Valid Reading to update transient virtual metering points
						const deltaConumption = ctx.params.reading - transientReading.reading;
						const settlement = await ctx.call("settlement.retrieve",{
							consumption: deltaConumption,
							startTime: transientReading.time,
							endTime: ctx.params.time
						});
						
						transientReading.virtual_0 += 1 * deltaConumption;
						for (const [key, value] of Object.entries(settlement)) {
							if((typeof transientReading[key] == "undefined") || (transientReading[key] == null)) {
								transientReading[key] = 0;
							}
							transientReading[key] += 1 * value; 
						}

						transientReading.reading = ctx.params.reading * 1;
						transientReading.time = ctx.params.time * 1;
						transientReading.id = transientReading._id;
						await ctx.call("readings.update",transientReading);
						delete transientReading.id;
						transientReading.processed = true;
					  } else {
						// Invalid transient reading - do not update
						transientReading.processed = false;
					  }
				}
				delete transientReading._id; // For operational safety we do not provide our db IDs to the client.
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
