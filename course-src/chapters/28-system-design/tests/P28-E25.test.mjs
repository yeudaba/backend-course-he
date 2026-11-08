import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createBloom } = await load(import.meta.url, "P28-E25.ts");

test("גודל לפי הנוסחה", () => {
  const b = createBloom(10_000, 0.01);
  assert.equal(b.m, 95_851);
  assert.equal(b.k, 7);
  assert.ok(b.bytes <= 12_000, `${b.bytes} בתים — כ־12KB ל־10,000 שמות`);
});
test("אין false negatives", () => {
  const b = createBloom(10_000, 0.01);
  const names = Array.from({ length: 10_000 }, (_, i) => `user${i}`);
  names.forEach((n) => b.add(n));
  assert.ok(names.every((n) => b.mightContain(n)), "כל מה שהוסף — mightContain = true");
});
test("שיעור false positives קרוב למה שביקשנו", () => {
  const b = createBloom(10_000, 0.01);
  for (let i = 0; i < 10_000; i++) b.add(`user${i}`);
  let fp = 0;
  for (let i = 0; i < 20_000; i++) if (b.mightContain(`other${i}`)) fp++;
  const rate = fp / 20_000;
  assert.ok(rate > 0.002 && rate < 0.02, `שיעור false positives: ${rate}`);
});
