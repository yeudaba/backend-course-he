import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { retryAsync } = await load(import.meta.url, "P10-E16.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("מצליח בניסיון השני, עם log", async () => {
  const logs = [];
  const r = await retryAsync(async (n) => { if (n < 2) throw new Error("busy"); return `ok${n}`; }, { log: (m) => logs.push(m) });
  assert.equal(r, "ok2");
  assert.deepEqual(logs, ["attempt 1 failed: busy"]);
});
test("כולם נכשלו — השגיאה האחרונה, בלי log על האחרון", async () => {
  const logs = [];
  await assert.rejects(retryAsync(async (n) => { throw new Error(`f${n}`); }, { attempts: 3, baseDelay: 1, log: (m) => logs.push(m) }), { message: "f3" });
  assert.equal(logs.length, 2);
});
test("ממתין עם backoff", async () => {
  const t = Date.now();
  await retryAsync(async (n) => { if (n < 3) throw new Error("x"); return 1; }, { baseDelay: 20 });
  assert.ok(Date.now() - t >= 55, "20 + 40ms לפחות");
});
