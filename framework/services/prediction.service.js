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
			async handler() {
                const dataset = tf.data.array([
                    [1, 100],
                    [2, 100],
                    [3, 100],
                    [4, 100],
                    [5, 100],
                  ]);
                  
                  const mappedDataset = dataset.map(row => ({dense_Dense1_input: row[0]}));
                  
                  // Erstellen Sie ein neuronales Netz
                  const model = await tf.sequential();
                  await model.add(tf.layers.dense({units: 1, inputShape: [1]}));
                  
                  // Trainieren Sie das neuronale Netz
                  await model.compile({optimizer: 'adam', loss: 'meanSquaredError'});
                  await model.fit(mappedDataset, {epochs: 100});
                  
                  // Verwenden Sie das neuronale Netz, um Vorhersagen zu generieren
                  const predictions = await model.predict([6]);
                  
                  return predictions;
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
