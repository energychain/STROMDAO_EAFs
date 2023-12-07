"use strict";
/**
 *  Service to do settlement (split of a consumption into virtual meters)
 */

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "settlement",

	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: ["tariff"],

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Retrieves a virtual split settlement of the given consumption parameters
		 *
		 * @returns
		 */
		retrieve: {
			rest: {
				method: "POST",
				path: "/retrieve"
			},
			params: {
				consumption: {type:"number",integer:true,min:0},
				startTime: {type:"number",integer:true,min:0},
				endTime: {type:"number",integer:true,min:0}
			},
			async handler(ctx) {

				// Retrieve labels for tariff
				let labels = await ctx.call("tariff.labels",{
					startTime: ctx.params.startTime,
					endTime: ctx.params.endTime					
				});

				const EPOCH_DURATION = await ctx.call("tariff.epochDuration");

				let settlement = {};
				let remain_consumption = ctx.params.consumption * 1;

				// handle epochs

				if(labels.length >0) {
					if(labels.length == 1) {
						if(typeof settlement[labels[0].label] == 'undefined') {
							settlement[labels[0].label] = 0;
						}
						settlement[labels[0].label] += remain_consumption;
						remain_consumption = 0;
					}  else {
						let avgepoch_consumption = ctx.params.consumption /  ((ctx.params.endTime - ctx.params.startTime)/EPOCH_DURATION);

						// Handle lower edge epoche
						if (typeof settlement[labels[0].label] == 'undefined') {
							settlement[labels[0].label] = 0;
						}
						let partOfFirstEpoch = 1-((ctx.params.startTime - (labels[0].epoch * EPOCH_DURATION))/EPOCH_DURATION);	
						let epochConsumption = partOfFirstEpoch * avgepoch_consumption;				
						settlement[labels[0].label] += epochConsumption;
						remain_consumption -= epochConsumption;

						for(let i=1;i<labels.length;i++) {
							if(typeof settlement[labels[i].label] == 'undefined') {
								settlement[labels[i].label] = 0;
							}
							let epochConsumption = avgepoch_consumption;
							if(epochConsumption > remain_consumption) {
								epochConsumption = remain_consumption;
							}
							remain_consumption -= epochConsumption;
							settlement[labels[i].label] += epochConsumption;
						}
					}
				} // endif labels.length == 0

				// Sanitycheck and Round
				let sum = 0;
				let selectedKey = null;
				for (let [key, value] of Object.entries(settlement)) {
					value = Math.round(value);
					settlement[key] = value;
					sum +=  1 * value;
					selectedKey = key;
				}
				if(selectedKey !== null) {
					settlement[selectedKey] += sum - ctx.params.consumption;
				}
				return settlement;
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
