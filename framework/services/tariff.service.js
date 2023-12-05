"use strict";
const EPOCH_DURATION = 3600000; // Defines how long an Epoch is. 
const TARIFF_SEGMENTS = 3; // Number of Tariff segments to create

/**
 * Tariff service providing labels for dynamic pricing model
 */
const DbService = require("moleculer-db");
/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "tariff",

	mixins: [DbService],
	/**
	 * Settings
	 */
	settings: {
		fields: ["_id","epoch","label"]
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		customLabels: {
			rest: {
				method: "GET",
				path: "/customLabels"
			},
			async handler(ctx) {
				return {
					virtual_1: "Hochtarif",
					virtual_2: "Mitteltarif",
					virtual_3: "Niedertarif"
				};
			}
		},
		epochDuration: {
			rest: {
				method: "GET",
				path: "/epochDuration"
			},
			async handler(ctx) {
				return EPOCH_DURATION;
			}
		},

		/**
		 * Provides labels for a given timeframe or next 24 hours
		 *
		 * @returns
		 */
		labels: {
			rest: {
				method: "GET",
				path: "/labels"
			},
			async handler(ctx) {
				
				if(typeof ctx.params.startTime == 'undefined') ctx.params.startTime = new Date().getTime();
				if(typeof ctx.params.endTime == 'undefined') ctx.params.endTime = (1 * ctx.params.startTime) + 24*60*60*1000;

				let startingEpoch = Math.floor(ctx.params.startTime/EPOCH_DURATION);
				let endingEpoch = Math.floor(ctx.params.endTime/EPOCH_DURATION);

				let labels = await ctx.call("tariff.find",{
					query: {
						epoch: {
							$gte: startingEpoch,
							$lte: endingEpoch
						}
					},
					sort: "epoch"
				});

				let existingEpochs = {};
				for(let i=0;i<labels.length;i++){
					existingEpochs["epoch_"+labels[i].epoch] = labels[i];
				}

				// Fill gaps if they exist and provde results array
				let results = [];
				for(let i=startingEpoch;i<=endingEpoch;i++) {
					if(typeof existingEpochs["epoch_"+i] == 'undefined') {
						existingEpochs["epoch_"+i] = {
							epoch: i,
							label: "virtual_"+(Math.floor(Math.random() * TARIFF_SEGMENTS) + 1)
						};

						await ctx.call("tariff.insert",{
							entity:existingEpochs["epoch_"+i]
						});
					}
					existingEpochs["epoch_"+i].time = i*EPOCH_DURATION;
					delete existingEpochs["epoch_"+i].id;
					delete existingEpochs["epoch_"+i]._id;

					results.push(existingEpochs["epoch_"+i]);
				}
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
