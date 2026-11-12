import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { notifyAll } = await load(import.meta.url, "P26.5-E45.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("במקביל, עם timeout, וכישלון לא מפיל", async () => {
  const got = [];
  const services = [
    { name: "emails", call: async (e) => { await sleep(50); got.push(["emails", e.id]); } },
    { name: "stock", call: async () => { throw new Error("503 Service Unavailable"); } },
    { name: "analytics", call: () => new Promise(() => {}) },
    { name: "sync-throw", call: () => { throw new Error("boom"); } },
    { name: "fast", call: async () => {} },
  ];
  const start = Date.now();
  const r = await notifyAll(services, { id: 42 }, 150);
  const took = Date.now() - start;
  assert.deepEqual(r, [
    { name: "emails", ok: true },
    { name: "stock", ok: false, error: "503 Service Unavailable" },
    { name: "analytics", ok: false, error: "timeout" },
    { name: "sync-throw", ok: false, error: "boom" },
    { name: "fast", ok: true },
  ]);
  assert.ok(took >= 140 && took < 400, `לקח ${took}ms — במקביל, עד ה־timeout`);
  assert.deepEqual(got, [["emails", 42]]);
});
test("כולם מהירים — לא מחכים ל־timeout", async () => {
  const start = Date.now();
  const r = await notifyAll([{ name: "a", call: async () => sleep(20) }, { name: "b", call: async () => sleep(30) }], {}, 5000);
  assert.deepEqual(r, [{ name: "a", ok: true }, { name: "b", ok: true }]);
  assert.ok(Date.now() - start < 1000);
});
