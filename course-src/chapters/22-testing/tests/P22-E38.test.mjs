import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P22-E38.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["runTests"])).runTests;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("עוברות ונכשלות — סינכרוני ואסינכרוני", async () => {
  const runTests = await get();
  const report = await runTests([
    { name: "a", fn: () => {} },
    { name: "b", fn: () => { throw new Error("שבור"); } },
    { name: "c", fn: async () => { await sleep(5); } },
    { name: "d", fn: async () => { await sleep(5); throw new RangeError("אסינכרוני"); } },
    { name: "e", fn: () => { throw "מחרוזת"; } },
    { name: "f", fn: () => Promise.reject(new Error("נדחה")) },
  ]);
  assert.deepEqual(report, {
    passed: ["a", "c"],
    failed: [
      { name: "b", message: "שבור" },
      { name: "d", message: "אסינכרוני" },
      { name: "e", message: "מחרוזת" },
      { name: "f", message: "נדחה" },
    ],
  });
});
test("אחת אחרי השנייה", async () => {
  const runTests = await get();
  const log = [];
  const mk = (name, ms) => ({ name, fn: async () => { log.push(`start ${name}`); await sleep(ms); log.push(`end ${name}`); } });
  await runTests([mk("1", 30), mk("2", 5), mk("3", 15)]);
  assert.deepEqual(log, ["start 1", "end 1", "start 2", "end 2", "start 3", "end 3"], "כל בדיקה מתחילה רק אחרי שהקודמת הסתיימה");
});
test("timeout", async () => {
  const runTests = await get();
  const t0 = Date.now();
  const report = await runTests([
    { name: "stuck", fn: () => new Promise(() => {}) },
    { name: "slow", fn: () => sleep(200) },
    { name: "ok", fn: () => sleep(10) },
  ], { timeoutMs: 50 });
  assert.deepEqual(report, { passed: ["ok"], failed: [{ name: "stuck", message: "timeout אחרי 50ms" }, { name: "slow", message: "timeout אחרי 50ms" }] });
  assert.ok(Date.now() - t0 < 400, "לא מחכים לבדיקה שנתקעה");
  const d = await runTests([{ name: "x", fn: () => sleep(20) }]);
  assert.deepEqual(d, { passed: ["x"], failed: [] }, "ברירת מחדל: 1000ms");
});
test("ריק", async () => {
  const runTests = await get();
  assert.deepEqual(await runTests([]), { passed: [], failed: [] });
});
