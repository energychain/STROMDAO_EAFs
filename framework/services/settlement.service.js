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
				consumption: {type:"number",integer:true,min:0, example: 12345, $$t: "Consumption in Wh"},
				startTime: {type:"number",integer:true,min:0, example: 1702217116620, $$t: "Start of consumption timeframe" },
				endTime: {type:"number",integer:true,min:0, example:1702217116620, $$t: "End of consumption timeframe"}
			},
			openapi: {
				summary: "Distribution of consumption in a time period to tariff segments.",
				description: "The settlement.retrieve action is designed for calculating how a consumption figure, measured between two meter readings, is divided across different tariff segments. It uses a given timeframe and the consumption amount as input parameters. The result of this action details the split of the consumption into designated tariff segments, labeled `virtual_1` to `virtual_9`. This action serves as a central point of calculation to allocate energy usage to the respective tariff sub-meters according to the defined tariff structure.",
				responses: {
					200: {
						"description": "Settlement result",
						"content": {
						"application/json": {
							"schema": {
								"type": `object`,
								"properties": {
									"virtual_1": { 
										type: `number`, 
										description: `Part of consumption in virtual_1 tariff` ,
										example: 123
									},
									"virtual_2": { 
										type: `number`, 
										description: `Part of consumption in virtual_2 tariff` ,
										example: 456
									},									
									"virtual_3": { 
										type: `number`, 
										description: `Part of consumption in virtual_3 tariff` ,
										example: 123
									},
									"virtual_4": { 
										type: `number`, 
										description: `Part of consumption in virtual_4 tariff` ,
										example: 456
									},
									"virtual_5": { 
										type: `number`, 
										description: `Part of consumption in virtual_5 tariff` ,
										example: 123
									},
									"virtual_6": { 
										type: `number`, 
										description: `Part of consumption in virtual_6 tariff` ,
										example: 456
									},
									"virtual_7": { 
										type: `number`, 
										description: `Part of consumption in virtual_7 tariff` ,
										example: 123
									},
									"virtual_8": { 
										type: `number`, 
										description: `Part of consumption in virtual_8 tariff` ,
										example: 456
									},
									"virtual_9": { 
										type: `number`, 
										description: `Part of consumption in virtual_9 tariff` ,
										example: 123
									}
								}
							},
							"example": {
								"virtual_1": 688,
								"virtual_2": 222,
								"virtual_3": 0
							}
						},
						},
					},
				},
			},
			async handler(ctx) {

				// Retrieve labels for tariff
				let labels = await ctx.call("tariff.labels",{
					startTime: ctx.params.startTime,
					endTime: ctx.params.endTime,
					injectedTariff:	ctx.params.injectedTariff // metering might have received signed labels that will overwrite actual 				
				});
				
				const EPOCH_DURATION = 1 * require("../runtime.settings.js")().EPOCH_DURATION;

				let settlement = {};
				let remain_consumption = ctx.params.consumption * 1;

				// handle epochs

				if(labels.length >0) {
					if(labels.length == 1) {
						if(typeof settlement[labels[0].label] == 'undefined') {
							settlement[labels[0].label] = 0;
						}
						settlement[labels[0].label] += remain_consumption;
						if(typeof ctx.params.meterId !== 'undefined') {
								await ctx.call("loadprofile.addSettlement",{
									meterId: ctx.params.meterId,
									epoch: labels[0].epoch,
									consumption: remain_consumption,
									label: labels[0].label							
								})
						}
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
						if(typeof ctx.params.meterId !== 'undefined') {
							await ctx.call("loadprofile.addSettlement",{
								meterId: ctx.params.meterId,
								epoch: labels[0].epoch,
								consumption: epochConsumption,
								label: labels[0].label							
							});
						}
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
							if(typeof ctx.params.meterId !== 'undefined') { 
								await ctx.call("loadprofile.addSettlement",{
									meterId: ctx.params.meterId,
									epoch: labels[i].epoch,
									consumption: epochConsumption,
									label: labels[i].label							
								});
							}
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
				await ctx.broker.emit("settlement.created", settlement);
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
