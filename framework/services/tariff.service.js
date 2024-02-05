"use strict";


/**
 * Tariff service providing labels for dynamic pricing model
 */

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "tariff",
	cacher: "Memory",
	/**
	 * Dependencies
	 */
	dependencies: ["tariff_model"],

	/**
	 * Actions
	 */
	actions: {
		customLabels: {
			rest: {
				method: "GET",
				path: "/customLabels"
			},
			cache: true,
			/**
			 * Provides displayable values (labels) for price segments. Mainly used by views (UI).
			 *
			 * @param {type} ctx - description of parameter
			 * @return {Object} - description of return value
			 */
			openapi: {
				summary: "Provides user-defined labels for instance-specific tariff segments",
				description: "The customLabels action related to tariffs provides custom labels for the tariff segments in an instance."  +  
						 "These are mapped to correspond with the specific use case, such as representing tariffs like `peak` and `off-peak`." +
						 "The internal identifiers range from `virtual_1` to `virtual_9` and are configured accordingly." +
						 "The configuration is done in the `runtime.settings.js` file and should be set before the initial start of the framework;" +
						 "it is not intended to be changed during runtime",
				responses: {
					200: {
						"description": "Mapping of internal label like `virtual_1` to runtime specific label like `off-peak`. Static response as it is taken from the `runtime.settings.js`.",
						"content": {
						"application/json": {
							"schema": {
								"type": `object`,
								"properties": {
									"virtual_1": { 
										type: `string`, 
										description: `Runtime specific name of tariff 1` ,
										example: "Niedertarif"
									},
									"virtual_2": { 
										type: `string`, 
										description: `Runtime specific name of tariff 2` ,
										example: "Mitteltarif"
									},
									"virtual_3": { 
										type: `string`, 
										description: `Runtime specific name of tariff 3` ,
										example: "Hochtarif"
									},
									"virtual_4": { 
										type: `string`, 
										description: `Runtime specific name of tariff 4` ,
										example: "Engpass"
									}
								}
							},
							"example": {
								"virtual_1": "Off-Peak",
								"virtual_2": "Standard",
								"virtual_3": "Peak"
							}
						},
						},
					},
				},
			},
			async handler(ctx) {
				let labels = JSON.parse(process.env.TARIFF_LABELS);
				let res = {};

				for (const [key, value] of Object.entries(labels)) {
					if(value.length > 0) {
						res[key] = value;
					}
				}
				return res;
			}
		},
		setPrices: {
			rest: {
				method: "POST",
				path: "/setPrices"
			},
			params: {
				virtual_1: { $$t: "Price for `virtual_1` tariff segment", type: "number", optional: false, example:0.2 },
				virtual_2: { $$t: "Price for `virtual_2` tariff segment", type: "number", optional: true , example:0.31},
				virtual_3: { $$t: "Price for `virtual_3` tariff segment", type: "number", optional: true , example:0.4 },
				virtual_4: { $$t: "Price for `virtual_4` tariff segment", type: "number", optional: true , example:0.5 },
				virtual_5: { $$t: "Price for `virtual_5` tariff segment", type: "number", optional: true , example:0.5 },
				virtual_6: { $$t: "Price for `virtual_6` tariff segment", type: "number", optional: true , example:0.5 },
				virtual_7: { $$t: "Price for `virtual_7` tariff segment", type: "number", optional: true , example:0.5 },
				virtual_8: { $$t: "Price for `virtual_8` tariff segment", type: "number", optional: true , example:0.5 },
				virtual_9: { $$t: "Price for `virtual_9` tariff segment", type: "number", optional: true , example:0.5 },
				fromTime: { $$t: "Valid from time (will be converted to epoch number)", type: "number", optional: true , example:1704120883259 }	
			},
			openapi: {
				summary: "Specify kWh price per tariff segment.",
				description: "The setPrices action allows setting a price per kilowatt-hour for each tariff segment within this environment for energy applications. You can retrieve the available tariff segments through the `tariff.customLabels` action. When setting prices, a price must be specified for each tariff segment using the internal labels `virtual_1` to `virtual_9`. Additionally, an optional time slice (epoch) can be provided to indicate from when the price information becomes valid",
				responses: {
					200: {
						"description": "Price Information as given in request",
						"content": {
						"application/json": {
							"schema": {
								"type": `object`,
								"properties": {
									"virtual_1": { 
										type: `number`, 
										description: `kWh price of tariff 1` ,
										example: 0.2
									},
									"virtual_2": { 
										type: `number`, 
										description: `kWh price of tariff 2` ,
										example: 0.31
									},
									"virtual_3": { 
										type: `number`, 
										description: `kWh price of tariff 3` ,
										example: 0.39
									}
								}
							},
							"example": {
								"virtual_1": 0.2,
								"virtual_2": 0.31,
								"virtual_3": 0.39
							}
						},
						},
					},
				},
			},
			async handler(ctx) {
				if(typeof ctx.params.fromTime == 'undefined') {
					ctx.params.fromEpoch = 0;
				} else {
					ctx.params.fromEpoch = Math.floor(ctx.params.fromTime / process.env.EPOCH_DURATION);
				}
				let labels = await ctx.call("tariff.customLabels");
				for (const [key, value] of Object.entries(labels)) {
					if(typeof ctx.params[key] !== 'undefined') {
						let previousDeclarations = await ctx.call("price_model.find",{
							query: {
								label: key,
								epoch: { $gte : ctx.params.fromEpoch}
							}
						});
						for(let j=0;j<previousDeclarations.length;j++) {
							await ctx.call("price_model.remove",{
								id: previousDeclarations[j]._id
							});
						}
						await ctx.call("price_model.insert",{entity:{
							epoch: ctx.params.fromEpoch,
							label: key,
							price: ctx.params[key] * 1
						}});
					}
				}	
				return ctx.params;
			}
		},
		getPrices: {
			rest: {
				method: "GET",
				path: "/getPrices"
			},
			cache: true,
			params: {
				epoch: { $$t: "Epoch to get price information for.", type: "number", optional: true, example:4711 }
			},
			openapi: {
				summary: "Gives setup price infos of current environment.",
				responses: {
					200: {
						"description": "Price Information for this environment",
						"content": {
						"application/json": {
							"schema": {
								"type": `object`,
								"properties": {
									"virtual_1": { 
										type: `number`, 
										description: `kWh price of tariff 1` ,
										example: 0.2
									},
									"virtual_2": { 
										type: `number`, 
										description: `kWh price of tariff 2` ,
										example: 0.31
									},
									"virtual_3": { 
										type: `number`, 
										description: `kWh price of tariff 3` ,
										example: 0.39
									}
								}
							},
							"example": {
								"virtual_1": 0.2,
								"virtual_2": 0.31,
								"virtual_3": 0.39
							}
						},
						},
					}
				}
			},
			async handler(ctx) {
				if(typeof ctx.params.epoch == 'undefined') {
					ctx.params.epoch = Math.floor(new Date().getTime() / process.env.EPOCH_DURATION * 1);
				}
				let results =  await ctx.call("price_model.find",{
					query:{
						epoch: {
							$lte: ctx.params.epoch * 1
						}
					},
					sort:"-epoch"
				});
				if(results.length == 0) {
					results = JSON.parse(process.env.DEFAULT_PRICING);
				}
				let labels = await ctx.call("tariff.customLabels");
				let prices = {};
				for (const [key, value] of Object.entries(labels)) {
					for(let i=0;(i<results.length) && (typeof prices[key] == 'undefined') ;i++) {
						if(results[i].label == key) {
							prices[key] = results[i].price;
							prices.fromEpoch = results[i].epoch;
							prices.fromTime = results[i].epoch * process.env.EPOCH_DURATION;
						}
					}
				}

				// Add next price update if known
				let changeResults =  await ctx.call("price_model.find",{
					query:{
						epoch: {
							$gte: ctx.params.epoch * 1
						}
					},
					sort:"-epoch"
				});

				if(changeResults.length > 0) {
					let pricesNew = {};
					for (const [key, value] of Object.entries(labels)) {
						for(let i=0;(i<changeResults.length) && (typeof pricesNew[key] == 'undefined') ;i++) {
							if(changeResults[i].label == key) {
								pricesNew[key] = changeResults[i].price;
								pricesNew.fromEpoch = changeResults[i].epoch;
								pricesNew.fromTime = changeResults[i].epoch * process.env.EPOCH_DURATION;
							}
						}
					}
					prices.nextChange = pricesNew;
				}
				return prices;
			}
		},
		listPrices: {
			rest: {
				method: "GET",
				path: "/listPrices"
			},
			async handler(ctx) {
				let results =  await ctx.call("price_model.find",{
					sort:"-epoch"
				});
				for(let i=0;i<results.length;i++) {
					results[i].fromTime = results[i].epoch * process.env.EPOCH_DURATION;
					delete results[i]._id;
				}
				return results;
			}
		},
		epochDuration: {
			rest: {
				method: "GET",
				path: "/epochDuration"
			},
			async handler(ctx) {
				return process.env.EPOCH_DURATION * 1;
			}
		},
		prices: {
			openapi: {
				summary: "Gives combined labels and prices.",
			},
			rest: {
				method: "GET",
				path: "/prices"
			},
			async handler(ctx) {
				let labels = await ctx.call("tariff.labels",ctx.params);
				for(let i=0;i<labels.length;i++) {
					const prices = await ctx.call("tariff.getPrices",{
						epoch: labels[i].epoch
					});
					labels[i].price = prices[labels[i].label];
					labels[i].jwt = await ctx.call("access.createTariffJWT",labels[i]);
				}
				return labels;
			}
		},
		/**
		 * Provides labels for a given timeframe or next 24 hours
		 *
		 * @returns
		 */
		labels: {
			cache: true,
			rest: {
				method: "GET",
				path: "/labels",
	
			},
			async handler(ctx) {
				
				if(typeof ctx.params.startTime == 'undefined') ctx.params.startTime = new Date().getTime();
				if(typeof ctx.params.endTime == 'undefined') ctx.params.endTime = (1 * ctx.params.startTime) + 24*60*60*1000;

				let startingEpoch = Math.floor(ctx.params.startTime/process.env.EPOCH_DURATION * 1);
				let endingEpoch = Math.floor(ctx.params.endTime/process.env.EPOCH_DURATION * 1);

				let labels = await ctx.call("tariff_model.find",{
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
				const DynamicSource = require(process.env.DYNAMIC_SIGNAL);
				const dynamic = new DynamicSource();

				for(let i=startingEpoch;i<=endingEpoch;i++) {
					if(typeof existingEpochs["epoch_"+i] == 'undefined') {

						// Implementation for actual dynamics source
						
						existingEpochs["epoch_"+i] = await dynamic.lookup(i);

						let price_info = await ctx.call("price_model.find",{
							query:{
								epoch: {
									$lte: i * 1
								},
								label: existingEpochs["epoch_"+i].label
							},
							sort:"-epoch"
						});
						if((typeof price_info !== 'undefined') && (price_info !== null) && (price_info.length >0)) {
							existingEpochs["epoch_"+i].price = price_info[0].price;
							existingEpochs["epoch_"+i].priceOfEpoch = price_info[0].epoch;
						}

						await ctx.call("tariff_model.insert",{
							entity:existingEpochs["epoch_"+i]
						});
					}
					existingEpochs["epoch_"+i].time = i*process.env.EPOCH_DURATION * 1;
					delete existingEpochs["epoch_"+i].id;
					delete existingEpochs["epoch_"+i]._id;

					results.push(existingEpochs["epoch_"+i]);
				}
				if(typeof ctx.params.injectedTariff !== 'undefined') {
					for(let i=0;i<ctx.params.injectedTariff.length;i++) {
						for(let j=0;j<results.length;j++) {
							if(results[j].epoch == ctx.params.injectedTariff[i].epoch) {
								results[j] = ctx.params.injectedTariff[i];
								results[j].injected = new Date().getTime();
							}
						}
					}
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
