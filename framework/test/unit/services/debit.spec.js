"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/debit.service");
require("../../../runtime.settings.js")();

describe("Test 'debit' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	let labels= null;

	describe("Test 'debit.invoice' action - basic", () => {
		let cost = Math.round(Math.random() * 1000);
		let cost_virtual_1 = Math.round(Math.random() * 1000);
		let consumption_virtual_1 = Math.round(Math.random() * 1000);

		let meterId = "test0_"+Math.random();
		it("Should be processed - random values for a meterId", async () => {
			let res =await broker.call("debit.invoice", {
				meterId: meterId,
				clearingTime: new Date().getTime() - 1000,
				cost: cost,
				cost_virtual_1: cost_virtual_1,
				consumption_virtual_1: consumption_virtual_1
			});
			expect(res.meterId).toBe(meterId);
		});
		it("Should be processed -  with defined update", async () => {
			let res =await broker.call("debit.invoice", {
				meterId: meterId,
				clearingTime: new Date().getTime() - 1000,
				cost: 10,
				cost_virtual_1: 10,
				consumption_virtual_1: 10
			});
			expect(res.cost).toBe(cost + 10);
			expect(res.cost_virtual_1).toBe(cost_virtual_1 + 10);
			expect(res.consumption_virtual_1).toBe(consumption_virtual_1 + 10);
		});
	
	});

});