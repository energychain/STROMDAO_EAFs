"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/tariff.service");


describe("Test 'tariff' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	let labels= null;

	describe("Test 'tariff.customLabels' action", () => {
		it("should return labels", async () => {
			let res =await broker.call("tariff.customLabels");
			expect(typeof res.virtual_1 !== 'undefined').toBe(true);
		});
	});
	describe("Test 'tariff.epochDuration' action", () => {
		it("should provide an epochDiration", async () => {
			let res =await broker.call("tariff.epochDuration");
			expect(res > 1).toBe(true);
		});
	});
	describe("Test 'tariff.labels' action", () => {
		it("should provide labels from now to near future", async () => {
			let res =await broker.call("tariff.labels");
			expect(res.length > 10).toBe(true);
			labels = res;
		});
		it("should change label for time", async () => {
			let res =await broker.call("tariff.labels",{
				startTime: labels[1].time,
				endTime: labels[labels.length -2].time
			});
			for(let i=0;i<res.length;i++) {
				expect(res[i].label == labels[i+1].label).toBe(true);
			}
		});
	});
});

