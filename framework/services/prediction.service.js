"use strict";
const tf = require('@tensorflow/tfjs');
//require('@tensorflow/tfjs-node');
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
					if(typeof ctx.params.settlements[i] !== 'undefined') {
						sum += ctx.params.settlements[i].consumption;
						if(ctx.params.settlements[i].consumption < min) {
							min = ctx.params.settlements[i].consumption;
						}
						if(ctx.params.settlements[i].consumption > max) {
							max = ctx.params.settlements[i].consumption;
						}
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
					if(typeof ctx.params.settlements[i] !== 'undefined') {
						ctx.params.settlements[i].consumption_normalized = ctx.params.settlements[i].consumption/sum;
					}
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
				if((typeof ctx.params.meterId !== 'undefined')  && (ctx.params.meterId.length == 0)) {
					delete ctx.params.meterId;
				}
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
					let historical = await ctx.call("loadprofile_model.find",{
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
				normalized_settlements.meterId = ctx.params.meterId;
				return normalized_settlements;
			}
		},
		x_epochs: {
			rest: "/x_epochs",
			openapi: {
				summary: "Simple machine learing based prediction of next epochs consumption",
				description: "The method operates by examining the consumption history of a meter during past epochs. An epoch in this context is defined as a distinct period during which energy consumption is measured and associated with a dynamic tariff. By assessing how much electricity was consumed during these previous intervals, the method constructs a model to forecast future usage. Limitation: Requires a sequence of readings without gaps."
			},
			params: {
				/*
				x: {
					type: "number", // Dirty Hack for "GET Validator Issue" - Should be "number"
					optional: true,
					$$t: "Size of epochs bach to predict next",
				},
				predict: {
					type: "number", // Dirty Hack for "GET Validator Issue" - Should be "number"
					optional: true,
					$$t: "Number of epochs to predict into future",
				},
				*/
				meterId: {
					type: "string",
					optional: true,
					$$t: "Meter ID - if omitted all meters will be taken",
				}
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				if(typeof ctx.params.x == 'undefined') {
					ctx.params.x = 4;
				}
				if(typeof ctx.params.predict == 'undefined') {
					ctx.params.predict = 2;
				}
				ctx.params.x *= 1;
				if((typeof ctx.params.meterId !== 'undefined')  && (ctx.params.meterId.length == 0)) {
					delete ctx.params.meterId;
				}
				 
				let epoch_sums = {};
				let last_epoch = Math.floor(new Date().getTime() / process.env.EPOCH_DURATION) - 1;
				let first_epoch = last_epoch - 100;

				let params = {
					start:first_epoch,
					end:last_epoch
				}
				if(typeof ctx.params.meterId !== 'undefined') {
					params.meterId = ctx.params.meterId;
				}
				const profile = await ctx.call("loadprofile_model.load",params);
				let normalized = [];

				if(typeof ctx.params.computedEpochs  !== 'undefined') {
					for(let i=0;i<ctx.params.computedEpochs.length;i++) {
						profile.epochs.push(ctx.params.computedEpochs[i])
					}
				} else {
					ctx.params.computedEpochs = [];
				}

				for(let i=0;i<profile.epochs.length - (ctx.params.x);i++) { 
					let settlements = []
					for(let j=0;j<ctx.params.x;j++) {
						delete profile.epochs[i+j].epoch_of_day;
						delete profile.epochs[i+j].time;
						settlements.push(profile.epochs[i+j]);
					}
					let trainset = await ctx.call("prediction.normalize",{settlements:settlements});
					const target =  profile.epochs[ctx.params.x+i];
					target.consumption_normalized = target.consumption/trainset.statistics.sum
					trainset = trainset.settlements;
					let trainarray = [];
					for(let j=0;j<trainset.length;j++) {
						trainarray.push(trainset[j].consumption_normalized);
					}
					normalized.push({
						training:trainarray,
						target:target.consumption_normalized
					}); 
				}
			
				let testing = [];
				let settlements = []
				for(let j=profile.epochs.length - (ctx.params.x);j<profile.epochs.length;j++) {					
					settlements.push(profile.epochs[j]);
				}
				let testset = await ctx.call("prediction.normalize",{settlements:settlements});
				
				for(let j=0;j<testset.settlements.length;j++) {
					if(typeof testset.settlements[j] !== 'undefined') {
						testing.push(testset.settlements[j].consumption_normalized);
					}
				}
				 			
				const train_X = normalized.map(item => item.training);
				const train_y = normalized.map(item => item.target);
			
				const model = tf.sequential();
				model.add(tf.layers.dense({ units: 10, inputShape: [ctx.params.x], activation: 'relu' }));
				model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
			  
				// Compile the model
				model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });
			  
				// Convert the training data to a TensorFlow tensor
				if((typeof train_X == 'undefined') || typeof train_X[0] == 'undefined') {
					return []
				}
				const xs = tf.tensor2d(train_X, [train_X.length, train_X[0].length]);
			  
				// Convert the target values to a TensorFlow tensor with the correct shape
				const ys = tf.tensor2d(train_y, [train_y.length, 1]);
			  
				// Train the model
				await model.fit(xs, ys, { epochs: 100 });
			  
				// Make predictions on new data
				const test_X = [testing]; // Replace with your own test data
				const input = tf.tensor2d(test_X, [test_X.length, test_X[0].length]);
				const predictions = model.predict(input);
			  
				let predictionArray = predictions.arraySync();
				let calculated_epoch = last_epoch + 1 + ctx.params.computedEpochs.length;
				let target = {
					epoch:calculated_epoch,
					consumption_normalized:predictionArray[0][0],
					consumption:predictionArray[0][0] * testset.statistics.sum,
					time:new Date().getTime((calculated_epoch)*process.env.EPOCH_DURATION),
					timeString:new Date((calculated_epoch)*process.env.EPOCH_DURATION).toISOString(),
					type:"prediction"
				}
				ctx.params.computedEpochs.push(target);

				if(ctx.params.computedEpochs.length < ctx.params.predict) {
					ctx.params.computedEpochs = await ctx.call("prediction.x_epochs",ctx.params);
				} else {

					for(let i=0;i<profile.epochs.length;i++) {
						const midnight = new Date( profile.epochs[i].epoch * process.env.EPOCH_DURATION).setHours(0,0,0,0);
						profile.epochs[i].time = profile.epochs[i].epoch * process.env.EPOCH_DURATION;
						profile.epochs[i].timeString = new Date(profile.epochs[i].time).toISOString();
						profile.epochs[i].epoch_of_day = profile.epochs[i].epoch - Math.floor(midnight / process.env.EPOCH_DURATION)
						if(profile.epochs[i].time < new Date().getTime() - process.env.EPOCH_DURATION) {
							profile.epochs[i].type = 'actual';
						} else {
							profile.epochs[i].type = 'prediction';
						}
					}
					ctx.params.computedEpochs = profile.epochs;
				}
				return ctx.params.computedEpochs;
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
