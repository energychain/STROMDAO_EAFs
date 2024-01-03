"use strict";

/**
 * Use this service to integrate a single action in development. Move it to a service in production by adding this method to a service in ./services/ 
 * 
 * 
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "statistics",

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
		overview: {
			rest: {
				method: "GET",
				path: "/overview"
			},
			async handler(ctx) {
				if(typeof ctx.params.delay == 'undefined') ctx.params.delay = 86400000;
				const ts = new Date().getTime();
				const startTime = ts - ctx.params.delay;
				const delayed = await ctx.call("debit_model.find",{query:{"clearingTime": {"$lt": ts-(1 * ctx.params.delay)}}});
				const active = await ctx.call("debit_model.find",{query:{"clearingTime": {"$gt": ts-(1 * ctx.params.delay)}}});
				let consumptions = {};
				let epochs = {};
				for(let i=0;i<active.length;i++) {
					const clearings = await ctx.call("clearing.retrieve",{"meterId": active[i].meterId});
					for(let j=0;j<clearings.length;j++) {
						if(clearings[j].endTime >= startTime) {
							if(typeof epochs["epoch_"+clearings[j].epoch] == 'undefined'){
								epochs["epoch_"+clearings[j].epoch] = {}
							}
							for (const [key, value] of Object.entries(clearings[j])) {
								if(key.indexOf('consumption')>-1) {
									if(typeof consumptions[key] == 'undefined') {
										consumptions[key] = 0;
									}
									if(typeof epochs["epoch_"+clearings[j].epoch][key] == 'undefined') {
										epochs["epoch_"+clearings[j].epoch][key] = 0;
									}
									consumptions[key] += value;
									epochs["epoch_"+clearings[j].epoch][key] += value;
								}
								
							}
						}
					}
				}

				const res = {
					delayed: delayed.length,
					active: active.length,
					consumptions: consumptions,
					epochs:epochs
				}
				return res;
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
