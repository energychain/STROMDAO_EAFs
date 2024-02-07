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
					// retrieve assetId via query
					const assets = await ctx.call("asset_model.find",{query:{assetId:ctx.params.assetId,type:ctx.params.type}});
					let found = false;
					for(let i=0;i<assets.length;i++) {
						if(assets[i].assetId == ctx.params.assetId) {
							if(typeof assets[i]._id !== 'undefined') assets[i].id = assets[i]._id;
							found = true;
							await ctx.call("asset_model.update",assets[i]);
						}
					}
					if(!found) {
						await ctx.call("asset_model.insert",{entity:ctx.params});
					}
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
					const assets = await ctx.call("asset_model.find",{query:{assetId:ctx.params.assetId}});
					return assets[0];
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
		query: {
			rest: {
				method: "GET",
				path: "/query"
			},
			openapi: {
				summary: "Native MongoDB find.",
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				if(db == null) {
					const assets = await ctx.call("asset_model.find",{query:ctx.params.q});
					return assets;
				} else {
					let res = await db.collection("assets").find(ctx.params.q).toArray();
					for(let i=0;i<res.length;i++) {
						delete res[i]._id;
					}
					return res;
				}	
			}
		},
		find: {
			rest: {
				method: "GET",
				path: "/find"
			},
			openapi: {
				summary: "Native MongoDB find.",
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				if(db == null) {
					let query = {"assetId" : ctx.params.q};
					if(typeof ctx.params.type !== 'undefined') {
						query.type = ctx.params.type;
					}
					const assets = await ctx.call("asset_model.find",{query:query});
					return assets;
				} else {
					let query = {"assetId" : {$regex : ctx.params.q}};
					if(typeof ctx.params.type !== 'undefined') {
						query.type = ctx.params.type;
					}
					let res = await db.collection("assets").find(query).toArray();
					for(let i=0;i<res.length;i++) {
						delete res[i]._id;
					}
					return res;
				}
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
