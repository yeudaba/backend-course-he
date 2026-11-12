import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { setTimeout as sleep } from "node:timers/promises";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

async function start(t, checkDb, timeoutMs = 50) {
  const { createHealth } = await exportsOf(import.meta.url, "P25-E80.ts", ["createHealth"]);
  const h = createHealth({ checkDb, timeoutMs });
  const app = express();
  app.get("/health", h.health);
  app.get("/ready", h.ready);
  const { base, close } = await listen(app);
  t.after(close);
  return { call: api(base), h };
}

test("הכול תקין", async (t) => {
  let calls = 0;
  const { call } = await start(t, async () => { calls++; });
  const a = await call("GET", "/health");
  assert.deepEqual([a.status, a.body, a.headers.get("cache-control")], [200, { status: "ok" }, "no-store"]);
  const b = await call("GET", "/ready");
  assert.deepEqual([b.status, b.body, b.headers.get("cache-control")], [200, { status: "ok" }, "no-store"]);
  assert.equal(calls, 1, "health לא בודק את המסד");
});
test("מסד נכשל או איטי ← 503 unavailable", async (t) => {
  const failing = await start(t, async () => { throw new Error("ECONNREFUSED"); });
  assert.deepEqual([(await failing.call("GET", "/ready")).status, (await failing.call("GET", "/ready")).body], [503, { status: "unavailable" }]);
  assert.equal((await failing.call("GET", "/health")).status, 200);
  const slow = await start(t, () => sleep(500), 40);
  const started = Date.now();
  const r = await slow.call("GET", "/ready");
  assert.deepEqual([r.status, r.body], [503, { status: "unavailable" }]);
  assert.ok(Date.now() - started < 300, "לא חיכה לבדיקה האיטית");
});
test("draining ← 503 בלי לבדוק את המסד", async (t) => {
  let calls = 0;
  const { call, h } = await start(t, async () => { calls++; });
  h.startDraining();
  const r = await call("GET", "/ready");
  assert.deepEqual([r.status, r.body, r.headers.get("cache-control")], [503, { status: "draining" }, "no-store"]);
  assert.equal(calls, 0);
  assert.equal((await call("GET", "/health")).status, 200, "liveness — עדיין חי");
});
test("לא משאיר טיימרים", async () => {
  const { createHealth } = await exportsOf(import.meta.url, "P25-E80.ts", ["createHealth"]);
  const h = createHealth({ checkDb: async () => {}, timeoutMs: 5000 });
  const res = { statusCode: 200, set() { return this; }, status(s) { this.statusCode = s; return this; }, json() { return this; } };
  const before = process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
  await h.ready({}, res);
  await h.ready({}, res);
  const after = process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
  assert.equal(after, before, "הטיימר של ה־timeout בוטל אחרי שהבדיקה הצליחה");
  assert.equal(res.statusCode, 200);
});
