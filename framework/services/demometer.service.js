"use strict";
/**
 *  Model to derive load profiles for predictive and statistical use for meters
 */




/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "demometer",
	
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		populate24h: {
			rest: {
				method: "GET",
				path: "/populate24h"
			},
			async handler(ctx) {

				if(typeof ctx.params.kwha == 'undefined') {
					ctx.params.kwha = 2000;
				}
				ctx.params.mwha = ctx.params.kwha / 250; // Viertelstunde kwh Werte!

				const profile900 =  [
					18.93009853,
					17.03008864,
					15.37008000,
					13.97007271,
					12.94006735,
					12.21006355,
					11.73006105,
					11.43005949,
					11.23005845,
					11.09005772,
					11.03005741,
					10.95005700,
					10.87005658,
					10.81005627,
					10.73005585,
					10.73005585,
					10.75005595,
					10.87005658,
					11.01005731,
					11.20005830,
					11.45005960,
					12.07006282,
					13.36006954,
					15.63008135,
					19.04009910,
					23.19012070,
					27.44014283,
					31.23016255,
					34.05017723,
					35.99018733,
					37.16019342,
					37.75019649,
					37.92019737,
					37.75019649,
					37.27019399,
					36.60019050,
					35.76018613,
					34.89018160,
					34.03017713,
					33.33017348,
					32.85017099,
					32.54016937,
					32.40016864,
					32.40016864,
					32.51016922,
					32.77017057,
					33.24017302,
					34.03017713,
					35.12018280,
					36.29018889,
					37.25019389,
					37.75019649,
					37.58019560,
					36.88019196,
					35.85018660,
					34.73018077,
					33.66017520,
					32.71017026,
					31.84016573,
					31.00016136,
					30.22015730,
					29.55015381,
					28.98015084,
					28.68014928,
					28.62014897,
					28.90015043,
					29.57015391,
					30.78016021,
					32.49016911,
					34.64018030,
					37.13019326,
					39.85020742,
					42.68022215,
					45.42023641,
					47.94024953,
					50.10026077,
					51.72026920,
					52.70027430,
					52.90027535,
					52.20027170,
					50.60026337,
					48.36025172,
					45.90023891,
					43.58022684,
					41.70021705,
					40.16020903,
					38.76020175,
					37.30019415,
					35.62018540,
					33.75017567,
					31.73016516,
					29.60015407,
					27.44014283,
					25.26013148,
					23.10012024,
					20.98010920,
				];
				const now = new Date().getTime();

				const dayNo = Math.floor(now / 86400000);
				const midnight = new Date(dayNo * 86400000).getTime() - 3600000;

				let ts = new Date().getTime() - 86400000;
				let lastreading = await ctx.call("metering.lastReading",{meterId:ctx.params.meterId});
				if((typeof lastreading == 'undefined')||(lastreading == null)) {
					lastreading = {
						time:0,
						reading:Math.round(Math.random()*1000000),
					};
				}
				if(ts<lastreading.time) ts = lastreading.time;
				
				let min_qod = 9999999;
				let max_qod = -99999999;
				let metered = [];
				for(let i=ts;i<now;i+=900000) {
					let d = 0;
					if(i<midnight) d=86400000;

					let qod = Math.abs(Math.floor((i-(midnight-d)) / 900000));
					if(qod < min_qod) min_qod = qod;
					if(qod > max_qod) max_qod = qod;
					let profilconsumption = profile900[qod]*ctx.params.mwha;
					profilconsumption = profilconsumption + ( (Math.random() * (profilconsumption/2))-profilconsumption/2 );
					lastreading.reading += Math.round(1 * profilconsumption);
					lastreading.time = i;
					 
					metered.push(await ctx.call("metering.updateReading",{meterId:ctx.params.meterId,time:i,reading:lastreading.reading}));
				}
				return metered;
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
