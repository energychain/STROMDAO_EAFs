"use strict";

/**
 * Meta Data Management for assets like meters, clients, etc... 
 * This service is only available for statefull (with mongodb) instances of the framework.
 * 
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
let db;

/** @type {ServiceSchema} */
module.exports = {
	name: "asset",

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
		upsert: {
			rest: "/upsert",
			params: {
				assetId: {
					type: "string",
					optional:false
				}
			},
			openapi: {
				summary: "Update/Insert a profile fields.",
				description: "Sets or updates a profile fields."
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				if(db == null) {
					return false;
				} else {
					return (await db.collection("assets").updateOne({assetId:ctx.params.assetId},{$set:ctx.params},{upsert:true})).result;
				}
			}
		},
		get: {
			rest: "/get",
			params: {
				assetId: {
					type: "string",
					optional:false
				}
			},
			openapi: {
				summary: "Get full profile of given assetId."
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				if(db == null) {
					return false;
				} else {
					let result = await db.collection("assets").findOne({assetId:ctx.params.assetId});
					delete result._id;
					return result;
				}
			}
		},
		find: {
			rest: "/find",
			openapi: {
				summary: "Native MongoDB find.",
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
					let res = await db.collection("assets").find(ctx.params).toArray();
					for(let i=0;i<res.length;i++) {
						delete res[i]._id;
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

		if((typeof process.env.db_adapter !=='undefined')&&(process.env.db_adapter !== null)&&(process.env.db_adapter !== 'null')) {
			const { MongoClient } = require("mongodb");
			const client = new MongoClient(process.env.db_adapter);
			await client.connect();
			db = client.db('stromdao_eafs');
		} else {
			console.log("Asset Service enabled but no db adapter configured");
		}
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
