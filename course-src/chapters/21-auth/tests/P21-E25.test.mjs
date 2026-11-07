import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import { createHash } from "node:crypto";

const { ApiKeysModule, ApiKeysService, CLOCK } = loadNest(import.meta.url, "P21-E25.ts");
const user = (id) => ({ headers: { "x-user-id": String(id) } });
const key = (k) => ({ headers: { "x-api-key": k } });

test("יצירה, רשימה ושימוש", async (t) => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const { call, moduleRef } = await nestApp(t, ApiKeysModule, { overrides: [[CLOCK, { now: () => clock.now }]] });
  let res = await call("POST", "/keys", { name: "CI", scopes: ["read"] }, user(1));
  assert.equal(res.status, 201);
  const { key: ciKey, id, prefix } = res.body;
  assert.match(ciKey, /^tk_[0-9a-f]{8}_[A-Za-z0-9_-]{32}$/, "פורמט tk_<prefix>_<secret>");
  assert.equal(ciKey.slice(3, 11), prefix);
  assert.equal(id, 1);

  const list = (await call("GET", "/keys", undefined, user(1))).body;
  assert.equal(list.length, 1);
  assert.equal(list[0].key, undefined, "המפתח המלא לא מוחזר שוב");
  assert.ok(!JSON.stringify(list).includes(ciKey.slice(12)), "גם לא חלקים ממנו מעבר ל־prefix");
  assert.equal(list[0].lastUsedAt, null);
  assert.ok(!JSON.stringify(moduleRef.get(ApiKeysService)).includes(ciKey), "במופע של ה־service אין את המפתח");
  assert.ok(JSON.stringify(moduleRef.get(ApiKeysService)).includes(createHash("sha256").update(ciKey).digest("hex")), "נשמר SHA-256 (hex)");

  clock.now = new Date("2026-11-04T11:00:00Z");
  res = await call("GET", "/data", undefined, key(ciKey));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { data: [1, 2, 3], owner: 1 });
  assert.equal((await call("GET", "/keys", undefined, user(1))).body[0].lastUsedAt, "2026-11-04T11:00:00.000Z");
  res = await call("POST", "/data", undefined, key(ciKey));
  assert.equal(res.status, 403);
  assert.equal(res.body.message, "למפתח אין הרשאת write");
  const rw = (await call("POST", "/keys", { name: "deploy", scopes: ["read", "write"] }, user(1))).body.key;
  assert.equal((await call("POST", "/data", undefined, key(rw))).status, 201);
});
test("מפתחות לא תקינים ובעלות", async (t) => {
  const { call } = await nestApp(t, ApiKeysModule);
  const k = (await call("POST", "/keys", { name: "a", scopes: ["read"] }, user(1))).body.key;
  let res = await call("GET", "/data");
  assert.equal(res.status, 401);
  assert.equal(res.body.message, "חסר X-Api-Key");
  for (const bad of ["nope", k.slice(0, -1) + (k.endsWith("A") ? "B" : "A"), "tk_00000000_" + "a".repeat(32)]) {
    res = await call("GET", "/data", undefined, key(bad));
    assert.equal(res.status, 401, bad);
    assert.equal(res.body.message, "מפתח לא תקין");
  }
  assert.equal((await call("DELETE", "/keys/1", undefined, user(2))).status, 404, "מפתח של מישהו אחר");
  assert.deepEqual((await call("GET", "/keys", undefined, user(2))).body, []);
  assert.equal((await call("DELETE", "/keys/1", undefined, user(1))).status, 204);
  assert.equal((await call("GET", "/data", undefined, key(k))).status, 401, "מפתח שבוטל");
  assert.equal((await call("GET", "/keys", undefined, user(1))).body[0].revoked, true);
  assert.equal((await call("GET", "/keys")).status, 401, "ניהול מפתחות דורש משתמש");
});
