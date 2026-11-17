import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E82.ts", ["checkCoverage"])).checkCoverage;
const m = (lines, statements, functions, branches) => ({ lines: { pct: lines }, statements: { pct: statements }, functions: { pct: functions }, branches: { pct: branches } });
const SUMMARY = {
  total: m(84.3, 84.8, 72.2, 59.1),
  "/app/src/tasks/tasks.service.ts": m(100, 100, 100, 90),
  "/app/src/pricing.ts": m(60, 62, 75, 40),
  "/app/src/money.ts": m(80, 80, 80, 80),
};

test("total", async () => {
  const check = await get();
  assert.deepEqual(check(SUMMARY, { lines: 80, branches: 60 }), ["total branches: 59.1% < 60%"]);
  assert.deepEqual(check(SUMMARY, { branches: 70, lines: 90, functions: 50 }), ["total lines: 84.3% < 90%", "total branches: 59.1% < 70%"], "לפי הסדר lines, statements, functions, branches");
  assert.deepEqual(check(SUMMARY, { lines: 84.3, statements: 84.8 }), [], "שווה לסף — עובר");
  assert.deepEqual(check(SUMMARY, {}), []);
});
test("perFile", async () => {
  const check = await get();
  assert.deepEqual(check(SUMMARY, {}, { lines: 80, branches: 50 }), ["/app/src/pricing.ts lines: 60% < 80%", "/app/src/pricing.ts branches: 40% < 50%"]);
  assert.deepEqual(check(SUMMARY, { functions: 80 }, { branches: 85 }), [
    "total functions: 72.2% < 80%",
    "/app/src/pricing.ts branches: 40% < 85%",
    "/app/src/money.ts branches: 80% < 85%",
  ], "קודם total, אחר כך הקבצים לפי הסדר במסמך");
});
