"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/access.service");

describe("Test 'access' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	let labels= null;

	describe("Test 'access.createMeterJWT' action", () => {
		it("should return a JWT that is verifieable", async () => {
			const testMeterId = new Date().toISOString()+"_"+Math.random();
			const jwt =await broker.call("access.createMeterJWT", {
				meterId:testMeterId
			});
			const validation = await broker.call("access.verifySelf",{token:jwt});

			expect(validation.meterId == testMeterId).toBe(true);
		});
	});
});

