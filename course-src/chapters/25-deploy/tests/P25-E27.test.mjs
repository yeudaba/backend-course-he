import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P25-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["formatUptime"])).formatUptime;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("עד שתי היחידות הגדולות, בלי אפסים", async () => {
  const formatUptime = await get();
  const cases = [
    [0, "0s"],
    [1, "1s"],
    [59, "59s"],
    [60, "1m"],
    [61, "1m 1s"],
    [3_599, "59m 59s"],
    [3_600, "1h"],
    [3_601, "1h", "1h 0m 1s — שתי היחידות הראשונות הן h ו־m, וה־0m לא מוצג"],
    [3_661, "1h 1m"],
    [86_400, "1d"],
    [90_061, "1d 1h"],
    [86_460, "1d", "1d 0h 1m — רק d ו־h נלקחות"],
    [1_216_859, "14d 2h"],
  ];
  for (const [s, expected, why] of cases) assert.equal(formatUptime(s), expected, why ?? `${s} שניות`);
});
test("קלט לא תקין ← RangeError", async () => {
  const formatUptime = await get();
  for (const bad of [-1, 1.5, NaN, Infinity]) assert.throws(() => formatUptime(bad), RangeError, String(bad));
});
