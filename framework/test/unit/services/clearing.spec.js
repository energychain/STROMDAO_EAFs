"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/clearing.service");


describe("Test 'clearing' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	
	let labels= null;

	describe("Test 'clearing.commit' action - basic", () => {
		it("Should be processed - random values for a meterId", async () => {
			let res =await broker.call("clearing.commit", {
				meterId: "test0_"+Math.random(),
				startTime: new Date().getTime() - 1000,
				endTime: new Date().getTime(),
				consumption: 100,
				virtual_0: 5,
				virtual_1:20,
				reading:123
			});
			expect(res.processed).toBe(true);
		});
		it("Should be processed - random values for second meter", async () => {
			let res =await broker.call("clearing.commit", {
				meterId: "test0_"+Math.random(),
				startTime: new Date().getTime() - 1000,
				endTime: new Date().getTime(),
				consumption: 100,
				virtual_0: 5,
				virtual_1:20,
				reading:123
			});
			expect(res.processed).toBe(true);
		});
	});

	const meterId = 'test_' + Math.random();
	const firstStartTime = new Date().getTime();
	const firstEndTime = firstStartTime + (5 * 3600000);
	const firstReading = Math.round(1000 * Math.random()) + 10;

	describe("Test 'clearing.commit' action - logic", () => {
		it("Commit first reading of meter", async () => {
			let res =await broker.call("clearing.commit", {
				meterId: meterId,
				startTime: firstStartTime,
				endTime: firstEndTime,
				consumption: 0,
				virtual_0: 0,
				virtual_1:0,
				reading:firstReading
			});
			expect(res.processed).toBe(true);
		});
		it("Commit older reading of meter", async () => {
			let res =await broker.call("clearing.commit", {
				meterId: meterId,
				startTime: firstStartTime,
				endTime:  Math.random(firstStartTime + (firstEndTime -  firstStartTime / 2)) ,
				consumption: 10,
				virtual_0: 0,
				virtual_1:0,
				reading:firstReading +10
			});
			expect(res.processed).toBe(false);
		});
		it("Commit valid second reading of meter", async () => {
			let res =await broker.call("clearing.commit", {
				meterId: meterId,
				startTime: firstEndTime +1 ,
				endTime:  firstEndTime + (firstEndTime -  firstStartTime ) ,
				consumption: 10,
				virtual_0: 0,
				virtual_1:0,
				reading:firstReading +10
			});
			expect(res.processed).toBe(true);
		});
	});
});

