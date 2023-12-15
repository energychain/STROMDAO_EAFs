"use strict";



describe("Test 'runtime' service", () => {
	require("../../../runtime.settings.js")({"TEST":"RUNTIME"});
	describe("Should have mandatory configurations ", () => {
		it("should have TARIFF_SEGMENTS", async () => {
			expect(typeof process.env.TARIFF_SEGMENTS !== 'undefined').toBe(true);
		});
		it("should have EPOCH_DURATION", async () => {
			expect(typeof process.env.EPOCH_DURATION !== 'undefined').toBe(true);
		});
		it("should have TARIFF_LABELS", async () => {
			expect(typeof process.env.TARIFF_LABELS !== 'undefined').toBe(true);
		});
		it("should have DEFAULT_PRICING", async () => {
			expect(typeof process.env.DEFAULT_PRICING !== 'undefined').toBe(true);
		});
		it("should have JWT_PUBLICKEY", async () => {
			expect(typeof process.env.JWT_PUBLICKEY !== 'undefined').toBe(true);
		});
		it("should have TEST", async () => {
			expect(typeof process.env.TEST !== 'undefined').toBe(true);
			expect(process.env.TEST == 'RUNTIME').toBe(true);
		});
	});
});