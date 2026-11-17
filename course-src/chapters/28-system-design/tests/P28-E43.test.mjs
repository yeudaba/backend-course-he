import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { estimateApp } = await load(import.meta.url, "P28-E43.ts");

async function start(t) {
  const { base, close } = await listen(estimateApp());
  t.after(close);
  return api(base);
}

test("חישוב, וברירת מחדל ל־peak", async (t) => {
  const call = await start(t);
  let r = await call("GET", "/estimate?users=10000000&perUser=10");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { avgRps: 1157.4, peakRps: 3472.2 });
  r = await call("GET", "/estimate?users=2000&perUser=30&peak=5");
  assert.deepEqual(r.body, { avgRps: 0.7, peakRps: 3.5 });
});
test("400 עם שמות השדות", async (t) => {
  const call = await start(t);
  let r = await call("GET", "/estimate?users=abc&perUser=1.5&peak=500");
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: "invalid query", fields: ["peak", "perUser", "users"] });
  r = await call("GET", "/estimate?perUser=3");
  assert.deepEqual(r.body.fields, ["users"]);
  r = await call("GET", "/estimate?users=-4&perUser=3&peak=0.5");
  assert.deepEqual(r.body.fields, ["peak", "users"]);
});
