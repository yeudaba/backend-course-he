import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const get = () => exportsOf(import.meta.url, "P20-E65.ts", ["PricingModule", "CONFIG", "PRICING", "RegularPricing", "HolidayPricing"]);
test("רגיל — ברירת המחדל", async (t) => {
  const { PricingModule } = get();
  const { call } = await nestApp(t, PricingModule);
  assert.deepEqual((await call("GET", "/price/19.9")).body, { base: 19.9, final: 19.9, strategy: "regular" });
  for (const bad of ["abc", "0", "-5"]) assert.equal((await call("GET", `/price/${bad}`)).status, 400, bad);
});
test("חג — דרך CONFIG בלבד", async (t) => {
  const { PricingModule, CONFIG } = get();
  const { call } = await nestApp(t, PricingModule, { overrides: [[CONFIG, { holiday: true }]] });
  assert.deepEqual((await call("GET", "/price/19.9")).body, { base: 19.9, final: 16.92, strategy: "holiday" });
  assert.deepEqual((await call("GET", "/price/100")).body, { base: 100, final: 85, strategy: "holiday" });
  assert.deepEqual((await call("GET", "/price/0.1")).body, { base: 0.1, final: 0.09, strategy: "holiday" });
});
test("המימושים עצמם", () => {
  const { RegularPricing, HolidayPricing } = get();
  assert.equal(new RegularPricing().price(89.9), 89.9);
  assert.equal(new HolidayPricing().price(89.9), 76.42);
  assert.equal(new HolidayPricing().price(39), 33.15);
});
