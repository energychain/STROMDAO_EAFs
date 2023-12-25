"use strict";
/**
 *  Model to provide debit management service
 */


const DbService = require("moleculer-db");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "debit",
	
	adapter: process.db_adapter,
	
	collection: "debit",

	mixins: [DbService],
	/**
	 * Settings
	 */
	settings: {
		fields: ["_id", "meterId", "clearingTime","reading","startReading","startTime","cost","consumption","consumption_virtual_1","consumption_virtual_2","consumption_virtual_3","consumption_virtual_4","consumption_virtual_5","consumption_virtual_6","consumption_virtual_7","consumption_virtual_8","consumption_virtual_9","cost_virtual_1","cost_virtual_2","cost_virtual_3","cost_virtual_4","cost_virtual_5","cost_virtual_6","cost_virtual_7","cost_virtual_8","cost_virtual_9"],
    },

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		assets: {
			rest: {
				method: "GET",
				path: "/assets"
			},
			async handler(ctx) {
				if((typeof ctx.params.q == 'undefined') || (ctx.params.q.length == 0)) {
					return (await ctx.call("debit.list",{ pageSize: 10,sort:"-clearingTime"})).rows;
				} else {
					return await ctx.call("debit.find",{search:ctx.params.q,searchFields:['meterId']});
				}
			}
		},
		delayed: {
			rest: {
				method: "GET",
				path: "/delayed"
			},
			async handler(ctx) {
				if(typeof ctx.params.delay == 'undefined') ctx.params.delay = 86400000;
				return await ctx.call("debit.find",{query:{"clearingTime": {"$lt": new Date().getTime()-(1 * ctx.params.delay)}}});
				
			}
		},
		invoice: {
			rest: {
				method: "put",
				path: "/invoice"
			},
			params: {
				"meterId": "string",
				"clearingTime": "number",
				"cost": "number"
			},
			async handler(ctx) {
				const existingInvoice = await ctx.call("debit.find",{search:ctx.params.meterId,searchFields:['meterId']});
				const invoice = ctx.params;
				if (existingInvoice.length > 0) {
					let current_invoice = existingInvoice[0];
					for (const [key, value] of Object.entries(current_invoice)) {
						if((key.indexOf('cost') == 0) || (key.indexOf('consumption') == 0)) {
							invoice[key] = (1* value) + (1 * invoice[key]);
						}
						if(key == '_id') {
							invoice.id = value;
						}
						if(key == 'id') {
							invoice.id = value;
						}
						if(key == 'reading') {
							invoice.reading = value;
						}
					} 
				}
				if(typeof invoice.id == 'undefined') {
					await ctx.call("debit.insert",{entity:invoice});
				} else {
					await ctx.call("debit.update",invoice);
				}
				await ctx.broker.emit("debit.invoice", invoice);
				return invoice;
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
