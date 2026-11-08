import { test } from "node:test";
import assert from "node:assert/strict";
import { shop } from "./_shop.mjs";
import { ADMIN } from "../../tools/app.mjs";

// פרויקט 3, שלב 1: משתמשים, JWT ותפקידים — דרך HTTP בלבד
test("הרשמה, כניסה ו־/auth/me", async (t) => {
  const { call, as } = await shop(t);
  const r = await call("POST", "/auth/register", { email: "  Dana@Example.COM ", password: "long-password-1", name: "דנה" });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.email, "dana@example.com", "אימייל באותיות קטנות, בלי רווחים");
  assert.equal(r.body.role, "customer");
  assert.ok(!JSON.stringify(r.body).toLowerCase().includes("password"), "בלי passwordHash בתשובה");

  const dup = await call("POST", "/auth/register", { email: "dana@example.com", password: "other-password-1", name: "דנה" });
  assert.equal(dup.status, 409);
  assert.equal(dup.body.error.code, "EMAIL_TAKEN");

  const bad = await call("POST", "/auth/login", { email: "dana@example.com", password: "wrong-password" });
  assert.equal(bad.status, 401);
  assert.equal(bad.body.error.code, "INVALID_CREDENTIALS");
  const nobody = await call("POST", "/auth/login", { email: "nobody@example.com", password: "wrong-password" });
  assert.deepEqual(nobody.body, bad.body, "משתמש שלא קיים ← בדיוק אותה תשובה (לא מגלים מי רשום)");

  const ok = await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" });
  assert.equal(ok.status, 200);
  assert.equal(typeof ok.body.accessToken, "string");
  const me = await as(ok.body.accessToken)("GET", "/auth/me");
  assert.equal(me.status, 200);
  assert.equal(me.body.email, "dana@example.com");
  assert.equal((await call("GET", "/auth/me")).status, 401, "בלי טוקן ← 401");
  assert.equal((await as("not.a.token")("GET", "/auth/me")).status, 401);
});

test("ולידציה, ו־role לא מגיע מהלקוח", async (t) => {
  const { call } = await shop(t);
  for (const body of [{}, { email: "x", password: "long-password-1", name: "x" }, { email: "a@example.com", password: "short", name: "x" }, { email: "a@example.com", password: "long-password-1" }]) {
    const r = await call("POST", "/auth/register", body);
    assert.equal(r.status, 400, JSON.stringify(body));
    assert.equal(r.body.error.code, "VALIDATION_ERROR");
  }
  const evil = await call("POST", "/auth/register", { email: "evil@example.com", password: "long-password-1", name: "x", role: "admin" });
  assert.ok(evil.status === 400 || (evil.status === 201 && evil.body.role === "customer"), `role בגוף: 400, או שמתעלמים — אף פעם לא admin (${evil.status} ${JSON.stringify(evil.body)})`);
});

test("מנהל ראשון מ־ADMIN_EMAIL / ADMIN_PASSWORD", async (t) => {
  const { call } = await shop(t);
  const r = await call("POST", "/auth/login", ADMIN);
  assert.equal(r.status, 200, "השרת יוצר בעלייה מנהל מ־ADMIN_EMAIL ו־ADMIN_PASSWORD");
  const me = await call("GET", "/auth/me", undefined, { headers: { authorization: `Bearer ${r.body.accessToken}` } });
  assert.equal(me.body.role, "admin");
});
