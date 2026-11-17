import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { verdict } = await load(import.meta.url, "P28-E100.ts");
const T = { p99Ms: 500, maxErrorRate: 0.001 };

test("עובר", () => {
  const results = Array.from({ length: 1000 }, (_, i) => ({ ms: i + 1, status: 200 }));
  assert.deepEqual(verdict(results.map((r) => ({ ...r, ms: Math.floor(r.ms / 3) })), T), { count: 1000, p50: 166, p99: 330, errorRate: 0, pass: true, reasons: [] });
});
test("נכשל בשניהם", () => {
  const results = Array.from({ length: 400 }, (_, i) => ({ ms: 100 + i * 2, status: i % 400 === 7 ? 503 : 200 }));
  results.push(...Array.from({ length: 50 }, () => ({ ms: 50, status: 429 })));
  const r = verdict(results, T);
  assert.equal(r.count, 450);
  assert.equal(r.p99, 890);
  assert.equal(r.p50, 448);
  assert.equal(r.errorRate, 1 / 450);
  assert.equal(r.pass, false);
  assert.deepEqual(r.reasons, ["p99 890ms > 500ms", "errors 0.22% > 0.1%"]);
});
test("ממיין מספרים, לא מחרוזות", () => {
  const r = verdict([{ ms: 100, status: 200 }, { ms: 20, status: 200 }, { ms: 3, status: 200 }], { p99Ms: 1000, maxErrorRate: 0 });
  assert.equal(r.p50, 20);
  assert.equal(r.p99, 100);
  assert.equal(r.pass, true);
});
test("ריק", () => {
  assert.deepEqual(verdict([], T), { count: 0, p50: 0, p99: 0, errorRate: 0, pass: false, reasons: ["no results"] });
});
