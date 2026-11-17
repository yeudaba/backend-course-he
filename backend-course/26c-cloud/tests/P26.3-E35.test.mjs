import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { availability, nines, downtimeMinutesPerYear } = await load(import.meta.url, "P26.3-E35.ts");
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} ≠ ${b}`);

test("availability", () => {
  close(availability(0.99, 2), 0.9999);
  close(availability(0.9, 3), 0.999);
  close(availability(0.95, 1), 0.95);
});
test("nines", () => {
  assert.equal(nines(0.999), 3);
  assert.equal(nines(0.9995), 3);
  assert.equal(nines(0.99), 2);
  assert.equal(nines(0.9), 1);
  assert.equal(nines(0.5), 0);
  assert.equal(nines(availability(0.99, 2)), 4);
  assert.equal(nines(1), Infinity);
});
test("downtimeMinutesPerYear", () => {
  assert.equal(downtimeMinutesPerYear(0.999), 526);
  assert.equal(downtimeMinutesPerYear(0.9999), 53);
  assert.equal(downtimeMinutesPerYear(0.99), 5256);
  assert.equal(downtimeMinutesPerYear(1), 0);
});
