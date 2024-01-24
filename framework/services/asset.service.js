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
		find: {
			rest: "/find",
			params: {
				q: {
					type: "string",
					optional:false
				}
			},
			async handler(ctx) {
				return await db.collection("assets").find({"assetId" : {$regex : ctx.params.q},"type":"balance"}).toArray();
			}

		},
		upsert: {
			rest: "/upsert",
			params: {
				assetId: {
					type: "string",
					optional:false
				},
				type: {
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
					return (await db.collection("assets").updateOne({assetId:ctx.params.assetId,type:ctx.params.type},{$set:ctx.params},{upsert:true})).result;
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
					let query = {assetId:ctx.params.assetId};
					if(typeof ctx.params.type !== 'undefined') {
						query.type = ctx.params.type;
					}
					let result = await db.collection("assets").findOne(query);
					if((typeof result == 'undefined') || (result == null)) {
						result = {
						};
					}
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
					/* Should have text index with fields:
							{
								"clientMeta.meterPointName" : "text",
								"clientMeta" : "text",
								"clientMeta.administrationNumber" : "text",
								"clientMeta.location.street" : "text",
								"clientMeta.manufacturerId" : "text",
								"clientMeta.location.city" : "text",
								"clientMeta.location.zip" : "text",
								"clientMeta.serialNumber" : "text",
								"clientMeta.fullSerialNumber" : "text",
								"clientMeta.metaName" : "text",
								"clientMeta.location.country" : "text"
							}
					*/

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
