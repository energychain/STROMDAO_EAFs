"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/metering.service");
const ReadingsService = require("../../../services/readings.service");
const SettlementService = require("../../../services/settlement.service");
const TariffService = require("../../../services/tariff.service");
const ClearingService = require("../../../services/clearing.service");
const PriceService = require("../../../services/price.service");
const AccessService = require("../../../services/access.service");
require("../../../runtime.settings.js")();

describe("Test 'metering' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);
	broker.createService(ReadingsService);
	broker.createService(SettlementService);
	broker.createService(TariffService);
	broker.createService(ClearingService);
	broker.createService(PriceService);
	broker.createService(AccessService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	const meterId = 'test_' + Math.random();
	const initialReading = Math.round(1000 * Math.random()) + 10;
	const initialTime = new Date().getTime();
	const secondReading = initialReading + Math.round(1000* Math.random()) + 10;
	const secondTime = initialTime + 5000;


	describe("Test 'metering.updateReading' action", () => {
		it("should reject without parameters", async () => {
			expect.assertions(1);
			try {
				await broker.call("metering.updateReading");
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});
	});

	describe("Test 'metering.lastReading' action", () => {
		it("should reject without parameters", async () => {
			expect.assertions(1);
			try {
				await broker.call("metering.lastReading");
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});
		it("should pass with meterId but give null as result", async () => {
			let res = await broker.call("metering.lastReading",{meterId:meterId});
			expect(res).toBe(null);
		});
		it("should reject with false authorization", async () => {
			expect.assertions(1);
		
			try {
				await broker.call("metering.lastReading",{meterId:meterId},{
					meta:{
							user: {
								meterId: Math.random()
							}
						}
					}
				);
			} catch(err) {
				const ApiGateway = require("moleculer-web");
				expect(err).toBeInstanceOf(ApiGateway.Errors.UnAuthorizedError);
			}
		});
		it("should pass with right authorization", async () => {
				broker.meta = {
					user: {
						meterId:  meterId
					}
				}
				let res = await broker.call("metering.lastReading",{meterId:meterId},{meta:{
					user: {
						meterId:  meterId
					}
				}});
				expect(res).toBe(null);
		});
	});

	describe("Test 'metering.updateReading' action", () => {
		it("should reject with just a meterId", async () => {
			expect.assertions(1);
			try {
				await broker.call("metering.updateReading",{meterId:meterId});
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});
		it("should reject with just a meterId,time", async () => {
			expect.assertions(1);
			try {
				await broker.call("metering.updateReading",{meterId:meterId,time:new Date().getTime()});
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});
		it("should reject with just a time,reading", async () => {
			expect.assertions(1);
			try {
				await broker.call("metering.updateReading",{reading:initialReading,time:new Date().getTime()});
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});
		it("should pass with meterId,reading,time", async () => {
			let res = await broker.call("metering.updateReading",{meterId:meterId,reading:initialReading,time:initialTime});
			expect(res.reading).toBe(initialReading);
			expect(res.time).toBe(initialTime);
			expect(res.virtual_0).toBe(0);
			expect(res.meterId).toBe(meterId);
			expect(res.processed).toBe(true);
		});
		it("should not be processed with meterId,reading,time from initial call", async () => {
			let res = await broker.call("metering.updateReading",{meterId:meterId,reading:initialReading,time:initialTime});
			expect(res.reading).toBe(initialReading);
			expect(res.time).toBe(initialTime);
			expect(res.virtual_0).toBe(0);
			expect(res.meterId).toBe(meterId);
			expect(res.processed).toBe(false);
		});
		it("should not be processed with older time", async () => {
			let res = await broker.call("metering.updateReading",{meterId:meterId,reading:initialReading,time:initialTime - 1000});
			expect(res.reading).toBe(initialReading);
			expect(res.time).toBe(initialTime);
			expect(res.virtual_0).toBe(0);
			expect(res.meterId).toBe(meterId);
			expect(res.processed).toBe(false);
		});
		it("should not be processed with lower reading", async () => {
			let res = await broker.call("metering.updateReading",{meterId:meterId,reading:initialReading - 1,time:initialTime});
			expect(res.reading).toBe(initialReading);
			expect(res.time).toBe(initialTime);
			expect(res.virtual_0).toBe(0);
			expect(res.meterId).toBe(meterId);
			expect(res.processed).toBe(false);
		});
		it("should be processed second reading", async () => {
			let res = await broker.call("metering.updateReading",{meterId:meterId,reading:secondReading,time:secondTime});
			expect(res.reading).toBe(secondReading);
			expect(res.time).toBe(secondTime);
			expect(res.virtual_0).toBe(secondReading - initialReading);
			expect(res.meterId).toBe(meterId);
			expect(res.processed).toBe(true);
		});
		it("should not be processed with meterId,reading,time from initial call", async () => {
			let res = await broker.call("metering.updateReading",{meterId:meterId,reading:initialReading,time:initialTime});
			expect(res.reading).toBe(secondReading);
			expect(res.time).toBe(secondTime);
			expect(res.virtual_0).toBe(secondReading - initialReading);
			expect(res.meterId).toBe(meterId);
			expect(res.processed).toBe(false);
		});
	});
	describe("Test 'metering.lastReading' action", () => {
		it("should give second reading values", async () => {
			let res = await broker.call("metering.lastReading",{meterId:meterId});
			
			expect(res.reading).toBe(secondReading);
			expect(res.time).toBe(secondTime);
			expect(res.virtual_0).toBe(secondReading - initialReading);
			expect(res.meterId).toBe(meterId);
			let saldo = (-2) * res.virtual_0;
			for (const [key, value] of Object.entries(res)) {
				if(key.indexOf('virtual_') == 0) {
					saldo += value;
				}
			}
			expect(saldo).toBe(0);
		});
	});


});

