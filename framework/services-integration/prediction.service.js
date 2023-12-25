"use strict";
const tf = require('@tensorflow/tfjs');

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "prediction",

	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler(ctx) {
				const data = (await ctx.call("loadprofile.list")).rows;
				return await ctx.call("prediction.normalize",{settlements:data});
			}
		},
		normalize: {
			rest: {
				method: "GET",
				path: "/normalize"
			},
			async handler(ctx) {
				let min = 999999999;
				let max = 0;
				let sum = 0;
				for(let i=0;i<ctx.params.settlements.length;i++) {
					sum += ctx.params.settlements[i].consumption;
					if(ctx.params.settlements[i].consumption < min) {
						min = ctx.params.settlements[i].consumption;
					}
					if(ctx.params.settlements[i].consumption > max) {
						max = ctx.params.settlements[i].consumption;
					}
				}
				ctx.params.statistics = {
					min:min,
					max:max,
					delta:max-min,
					sum:sum,
					min_normalized:min/sum,
					max_normalized:max/sum,
					delta_normalized:(max-min)/sum
				}
				for(let i=0;i<ctx.params.settlements.length;i++) {
					ctx.params.settlements[i].consumption_normalized = ctx.params.settlements[i].consumption/sum;
				}
				return ctx.params;
			}
		},
		
		/**
		 * epoch_of_day prediction
		 * 
		 * @param {String} name - User name
		 */
		epoch_of_day: {
			rest: "/epoch_of_day",
			/** @param {Context} ctx  */
			async handler(ctx) {
				// How many Epochs do we have per DAY?
				const EPOCHS_PER_DAY = Math.floor(86400000 / process.env.EPOCH_DURATION);
				// Collect data for all meters 
				let epoch_sums = {};

				for(let i = 0; i < EPOCHS_PER_DAY; i++) {
					const query = {
						epoch_of_day:i
					}
					if(typeof ctx.params.meterId !== 'undefined') {
						query.meterId = ctx.params.meterId;
					}
					let historical = await ctx.call("loadprofile.find",{
						query: query,
						limit:10000,
						sort:"-epoch"
					});
					epoch_sums["epoch_of_day_"+i] = {
						epoch_of_day:i,
						consumption:0,
						cnt:0
					};
					let sum = 0;
					for(let j=0;j<historical.length;j++) {
						epoch_sums["epoch_of_day_"+i].consumption += historical[j].consumption;
						epoch_sums["epoch_of_day_"+i].cnt ++;
					}
				}
				const settlements = [];
				for (const [key, value] of Object.entries(epoch_sums)) {
					value.consumption = Math.round(value.consumption/value.cnt);
					//delete value.cnt;
					settlements.push(value);
				}

				const normalized_settlements = await ctx.call("prediction.normalize",{settlements:settlements}); 
				if(typeof ctx.params.meterId !== 'undefined') {
					let reference = await ctx.call("prediction.epoch_of_day",{});
					for(let i=0;i<normalized_settlements.settlements.length;i++) {
						normalized_settlements.settlements[i].consumption_reference = reference.settlements[i].consumption_normalized;
						normalized_settlements.settlements[i].consumption_reference_delta = normalized_settlements.settlements[i].consumption_normalized - reference.settlements[i].consumption_normalized; 
					}
					normalized_settlements.statistics.min_reference_normalized = reference.statistics.min_normalized;
					normalized_settlements.statistics.max_reference_normalized = reference.statistics.max_normalized;
					normalized_settlements.statistics.delta_reference_normalized = reference.statistics.delta_normalized;

				}
				return normalized_settlements;
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
