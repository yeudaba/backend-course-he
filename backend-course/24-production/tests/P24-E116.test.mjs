import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E116.ts", ["quantileFromBuckets"])).quantileFromBuckets;
const B = [
  { le: 0.05, count: 600 }, { le: 0.1, count: 850 }, { le: 0.25, count: 930 },
  { le: 0.5, count: 960 }, { le: 1, count: 990 }, { le: Infinity, count: 1000 },
];
const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} ≠ ${b}`);

test("הדוגמה של E110", async () => {
  const q = await get();
  close(q(B, 0.5), 0.05 * (500 / 600), "p50 — בדלי הראשון, מ־0");
  close(q(B, 0.6), 0.05, "בדיוק בגבול");
  close(q(B, 0.95), 0.25 + 0.25 * (20 / 30), "p95");
  close(q(B, 0.99), 1, "p99 — בדיוק בגבול של le=1");
  close(q(B, 0.995), 1, "בדלי של +Inf ← הגבול הסופי הגבוה");
  close(q(B, 1), 1, "q = 1");
  close(q(B, 0), 0, "q = 0");
});
test("דליים ריקים באמצע ו־total = 0", async () => {
  const q = await get();
  const b = [{ le: 0.1, count: 10 }, { le: 0.2, count: 10 }, { le: 0.4, count: 20 }, { le: Infinity, count: 20 }];
  close(q(b, 0.5), 0.1, "rank 10 — נמצא כבר בדלי הראשון");
  close(q(b, 0.75), 0.2 + 0.2 * (5 / 10), "מדלגים על הדלי הריק");
  assert.ok(Number.isNaN(q([{ le: 1, count: 0 }, { le: Infinity, count: 0 }], 0.5)));
});
test("q לא תקין", async () => {
  const q = await get();
  for (const x of [-0.1, 1.5, NaN]) assert.throws(() => q(B, x), RangeError, String(x));
});
