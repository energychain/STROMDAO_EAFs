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
				let stats = {
					min:min,
					max:max,
					sum:sum 
				}
				for(let i=0;i<ctx.params.settlements.length;i++) {
					ctx.params.settlements[i].consumption_normalized = ctx.params.settlements[i].consumption/sum;
				}
				return ctx.params;
			}
		},
		/**
		 * Welcome, a username
		 *
		 * @param {String} name - User name
		 */
		welcome: {
			rest: "/welcome",
			params: {
				name: "string"
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				return `Welcome, ${ctx.params.name}`;
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
