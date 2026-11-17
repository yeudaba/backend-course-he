import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const m = loadNest(import.meta.url, "P21-E54.ts");
const SECRET = "p21-e54-secret-at-least-32-chars!!";
const now = () => Math.floor(Date.now() / 1000);
const good = jwt.sign({ sub: 7, role: "user", iat: now(), exp: now() + 900 }, SECRET);
const admin = jwt.sign({ sub: 1, role: "admin", iat: now(), exp: now() + 900 }, SECRET);
const expired = jwt.sign({ sub: 7, role: "user", iat: now() - 1000, exp: now() - 100 }, SECRET);
const forged = jwt.sign({ sub: 7, role: "admin", iat: now(), exp: now() + 900 }, "another-secret-another-secret-123");

test("ייצוא", () => {
  for (const n of ["SECRET", "JwtAuthGuard", "MeController", "AppModule"]) assert.ok(m[n], `הקובץ לא מייצא את ${n}`);
  assert.equal(m.SECRET, SECRET);
});
test("Bearer", async (t) => {
  const { call } = await nestApp(t, m.AppModule);
  assert.deepEqual((await call("GET", "/hello")).body, { hello: "world" }, "/hello פתוח");
  let r = await call("GET", "/me", undefined, { headers: { authorization: `Bearer ${good}` } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { id: 7, role: "user" });
  r = await call("GET", "/me", undefined, { headers: { authorization: `bearer   ${admin}` } });
  assert.deepEqual(r.body, { id: 1, role: "admin" }, "bearer באותיות קטנות, כמה רווחים");
  r = await call("GET", "/me");
  assert.equal(r.status, 401);
  assert.equal(r.body.message, "נדרשת התחברות");
  for (const tk of [expired, forged, "abc.def.ghi"]) {
    r = await call("GET", "/me", undefined, { headers: { authorization: `Bearer ${tk}` } });
    assert.equal(r.status, 401);
    assert.equal(r.body.message, "טוקן לא תקין");
  }
});
test("cookie", async (t) => {
  const { call } = await nestApp(t, m.AppModule);
  let r = await call("GET", "/me", undefined, { headers: { cookie: `theme=dark; access_token=${good}; lang=he` } });
  assert.equal(r.status, 200, "טוקן מתוך cookie בשם access_token");
  assert.deepEqual(r.body, { id: 7, role: "user" });
  r = await call("GET", "/me", undefined, { headers: { cookie: `access_token=${admin}` } });
  assert.deepEqual(r.body, { id: 1, role: "admin" });
  r = await call("GET", "/me", undefined, { headers: { cookie: `my_access_token=${good}; theme=dark` } });
  assert.equal(r.status, 401, "my_access_token הוא cookie אחר");
  assert.equal(r.body.message, "נדרשת התחברות");
  r = await call("GET", "/me", undefined, { headers: { cookie: `access_token=${forged}` } });
  assert.equal(r.body.message, "טוקן לא תקין");
  r = await call("GET", "/me", undefined, { headers: { cookie: "access_token=x=y=" } });
  assert.equal(r.body.message, "טוקן לא תקין", "הכול אחרי ה־= הראשון הוא הערך");
});
test("יש header — לא נופלים ל־cookie", async (t) => {
  const { call } = await nestApp(t, m.AppModule);
  let r = await call("GET", "/me", undefined, { headers: { authorization: "Basic abc", cookie: `access_token=${good}` } });
  assert.equal(r.status, 401);
  assert.equal(r.body.message, "נדרשת התחברות");
  r = await call("GET", "/me", undefined, { headers: { authorization: `Bearer ${admin}`, cookie: `access_token=${good}` } });
  assert.deepEqual(r.body, { id: 1, role: "admin" }, "ה־header קודם");
});
