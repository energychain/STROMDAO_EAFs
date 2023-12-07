"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/settlement.service");
const TariffService = require("../../../services/tariff.service");

describe("Test 'settlement' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);
	broker.createService(TariffService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	let labels= null;
	const testConsumption1 = Math.round(100 + Math.random());
	const testConsumption2 = testConsumption1 * 4;

	describe("Test 'settlement.retrieve' action", () => {
		it("should valid settlement", async () => {
			let res =await broker.call("settlement.retrieve",{
				consumption:testConsumption1,
				startTime: new Date().getTime(),
				endTime: new Date().getTime() + (5 * 3600000)
			});
			let saldo = 0;
			for (const [key, value] of Object.entries(res)) {
					saldo += value;
			}
			expect(saldo).toBe(testConsumption1);
		});
		it("should valid settlement", async () => {
			let res =await broker.call("settlement.retrieve",{
				consumption:testConsumption1,
				startTime: new Date().getTime(),
				endTime: new Date().getTime() + 1
			});
			let saldo = 0;
			for (const [key, value] of Object.entries(res)) {
					saldo += value;
			}
			expect(saldo).toBe(testConsumption1);
		});
	});


});

