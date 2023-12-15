"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/access.service");
const ClientActivation = require("../../../services/clientactivation.service");
require("../../../runtime.settings.js")();

describe("Test 'access' service", () => {
	
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);
	broker.createService(ClientActivation);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());
	let meterId = '' + Math.random() + '_' + new Date().getTime();
	let activationSecret = '';

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

	describe("Test 'access.publicKey' action", () => {
		it("should return a publicKey that fits to our process.env", async () => {
			const pki  =await broker.call("access.publicKey");
			expect(pki.publicKey == process.env.JWT_PUBLICKEY).toBe(true);
		});
	});

	describe("Test 'access.createMeterActivationCode' action", () => {
		it("should return a publicKey that fits to our process.env", async () => {
			const pki  =await broker.call("access.createMeterActivationCode",{
				meterId: meterId
			});
			expect(typeof pki.token !== 'undefined').toBe(true);
			expect(typeof pki.activationSecret !== 'undefined').toBe(true);
			activationSecret = pki.activationSecret;
		});
	});
	describe("Test 'access.activation' action", () => {
		it("should return a JWT for reating updates", async () => {
			const pki  =await broker.call("access.activation",{
				meterId: meterId,
				activationSecret: activationSecret
			});
			expect(typeof pki.token !== 'undefined').toBe(true);
			activationSecret = pki.activationSecret;
		});
		it("test multi use token", async () => {
			process.env.ACTIVATIONMULTIUSE = JSON.stringify(false);

			const pki  =await broker.call("access.activation",{
				meterId: meterId,
				activationSecret: activationSecret
			});
			activationSecret = pki.activationSecret;
			const pki2  =await broker.call("access.activation",{
				meterId: meterId,
				activationSecret: activationSecret
			});
			expect(typeof pki2.activationSecret !== 'undefined').toBe(true);
		});
		it("test invalid actkivation", async () => {
			expect.assertions(1);
			try {
				const pki  =await broker.call("access.activation",{
					meterId: meterId,
					activationSecret: activationSecret + '_'
				});
			} catch(e) {
				expect(e.toString()).toBe("Error: Activation failed")
			}
		});
		describe("Test 'access.createMeterActivationCode' action Pass 2", () => {
			it("should return a new activationSecret", async () => {
				const pki  =await broker.call("access.createMeterActivationCode",{
					meterId: meterId
				});
				expect(typeof pki.token !== 'undefined').toBe(true);
				expect(pki.activationSecret !== activationSecret).toBe(true);
			});
		});
	});
	describe("Test 'access.demo' action", () => {
		it("should return a JWT for demo meter update", async () => {
			const pki  =await broker.call("access.demo");
			expect(typeof pki == 'string').toBe(true);
		});
	});


	
});


