import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { SecretModule, API_KEYS } = loadNest(import.meta.url, "P20-E14.ts");

test("ApiKeyGuard", async (t) => {
  const { call } = await nestApp(t, SecretModule, { overrides: [[API_KEYS, new Set(["test-key"])]] });
  assert.deepEqual((await call("GET", "/public")).body, { ok: true }, "בלי guard");
  let res = await call("GET", "/secret");
  assert.equal(res.status, 401, "בלי header");
  assert.equal(res.body.message, "חסר X-Api-Key");
  res = await call("GET", "/secret", undefined, { headers: { "x-api-key": "dev-key" } });
  assert.equal(res.status, 403, "dev-key הוחלף ב־override, לכן לא מוכר");
  assert.equal(res.body.message, "מפתח לא מוכר");
  res = await call("GET", "/secret", undefined, { headers: { "x-api-key": "test-key" } });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { secret: 42 });
});
test("ברירת המחדל: dev-key", async (t) => {
  const { call } = await nestApp(t, SecretModule);
  assert.equal((await call("GET", "/secret", undefined, { headers: { "x-api-key": "dev-key" } })).status, 200);
});
