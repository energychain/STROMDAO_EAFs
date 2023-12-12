"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/tariff.service");
const PriceService = require("../../../services/price.service");
const AccessService = require("../../../services/access.service");

describe("Test 'tariff' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);
	broker.createService(PriceService);
	broker.createService(AccessService);

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
	describe("Test 'tariff.setPrices' action", () => {
		it("should provide labels from now to near future", async () => {
			let res =await broker.call("tariff.setPrices",{
				virtual_1:0.1,
				virtual_2:0.2,
				virtual_3:0.4
			});
			expect(typeof res.virtual_1 !== 'undefined').toBe(true);
		});
		it("should return a valid price for virtual_1", async () => {
			let res =await broker.call("tariff.getPrices",{
			});
			expect(typeof res.virtual_1 !== 'undefined').toBe(true);
		});
		it("should allow updates", async () => {
			let res =await broker.call("tariff.setPrices",{
				virtual_1:0.2,
				virtual_2:0.4,
				virtual_3:0.7
			});
			expect(typeof res.virtual_1 !== 'undefined').toBe(true);
		});
	});
	describe("Test 'tariff.prices' action", () => {
		it("should provide labels from now to near future", async () => {
			let res =await broker.call("tariff.prices");
			expect(typeof res[0].price !== 'undefined').toBe(true);
			let found = false;
			if((res[0].price == 0.1)  && (res[0].label == 'virtual_1')) found = true;
			if((res[0].price == 0.4)  && (res[0].label == 'virtual_2')) found = true;
			if((res[0].price == 0.7)  && (res[0].label == 'virtual_3')) found = true;
			expect(found).toBe(true);
		});
	});
});

