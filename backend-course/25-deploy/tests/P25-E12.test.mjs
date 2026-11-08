import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { readyHandler } = await load(import.meta.url, "P25-E12.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function start(t, checks, opts) {
  const app = express();
  app.get("/ready", readyHandler(checks, opts));
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("הכול תקין", async (t) => {
  const call = await start(t, { db: async () => 1, cache: async () => "PONG" });
  const r = await call("GET", "/ready");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { status: "ok", checks: { db: "up", cache: "up" } });
  assert.equal(r.headers.get("cache-control"), "no-store");
});
test("בדיקה שנכשלת או זורקת", async (t) => {
  const call = await start(t, { db: async () => { throw new Error("ECONNREFUSED"); }, cache: async () => 1, sync: () => { throw new Error("x"); } });
  const r = await call("GET", "/ready");
  assert.equal(r.status, 503);
  assert.deepEqual(r.body, { status: "unavailable", checks: { db: "down", cache: "up", sync: "down" } });
});
test("timeout — ובמקביל", async (t) => {
  const call = await start(t, { db: () => sleep(5000), a: () => sleep(150), b: () => sleep(150) }, { timeoutMs: 300 });
  const started = Date.now();
  const r = await call("GET", "/ready");
  const took = Date.now() - started;
  assert.deepEqual(r.body.checks, { db: "timeout", a: "up", b: "up" });
  assert.ok(took < 1000, `לא מחכה 5 שניות, ולא 150+150+… (${took}ms)`);
});
