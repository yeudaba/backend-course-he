import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E18.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
const keys = new Map([["k-123", "חנות הקפה"]]);

test("מפתח API", async (t) => {
  const call = await start(t, createApp(keys));
  assert.deepEqual((await call("GET", "/public")).body, { ok: true });
  let res = await call("GET", "/api/me");
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, "MISSING_API_KEY");
  assert.equal(res.headers.get("www-authenticate"), "ApiKey");
  res = await call("GET", "/api/me", undefined, { headers: { "X-Api-Key": "wrong" } });
  assert.equal(res.status, 403);
  assert.equal(res.body.error.code, "INVALID_API_KEY");
  res = await call("GET", "/api/me", undefined, { headers: { "x-api-key": "k-123" } });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { client: "חנות הקפה" });
  assert.equal((await call("GET", "/api/other")).status, 401, "כל /api מוגן — גם כתובת שלא קיימת");
});
