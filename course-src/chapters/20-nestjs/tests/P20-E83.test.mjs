import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const get = () => exportsOf(import.meta.url, "P20-E83.ts", ["HealthModule", "HealthController", "DB_PING"]);
test("up", async (t) => {
  const { HealthModule } = get();
  const { call } = await nestApp(t, HealthModule);
  const r = await call("GET", "/health");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { status: "ok", checks: { db: "up" } });
});
test("down — שגיאה, ו־timeout", async (t) => {
  const { HealthModule, DB_PING } = get();
  const failing = await nestApp(t, HealthModule, { overrides: [[DB_PING, async () => { throw new Error("ECONNREFUSED"); }]] });
  const r = await failing.call("GET", "/health");
  assert.equal(r.status, 503);
  assert.deepEqual(r.body, { status: "error", checks: { db: "down" } });
  let calls = 0;
  const stuck = await nestApp(t, HealthModule, { overrides: [[DB_PING, () => { calls++; return new Promise(() => {}); }]] });
  const start = Date.now();
  const s = await stuck.call("GET", "/health");
  const ms = Date.now() - start;
  assert.equal(s.status, 503);
  assert.deepEqual(s.body, { status: "error", checks: { db: "down" } });
  assert.ok(ms >= 150 && ms < 1000, `ping תקוע — תשובה אחרי ~200ms (קיבלנו ${ms}ms)`);
  assert.equal(calls, 1);
  const slowOk = await nestApp(t, HealthModule, { overrides: [[DB_PING, () => new Promise((r) => setTimeout(r, 50))]] });
  assert.equal((await slowOk.call("GET", "/health")).status, 200, "50ms — בזמן");
});
