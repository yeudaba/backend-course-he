import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import { JwtService } from "@nestjs/jwt";

const { AuthModule, JWT_SECRET } = loadNest(import.meta.url, "P21-E20.ts");

test("הרשמה לא מחזירה hash", async (t) => {
  const { call } = await nestApp(t, AuthModule);
  const res = await call("POST", "/auth/register", { email: "dana@example.com", password: "long-password-1" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, email: "dana@example.com", role: "user" });
});
test("כניסה עובדת", async (t) => {
  const { call } = await nestApp(t, AuthModule);
  await call("POST", "/auth/register", { email: "dana@example.com", password: "long-password-1" });
  const res = await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" });
  assert.equal(res.status, 200, "סיסמה נכונה");
  assert.equal((await call("POST", "/auth/login", { email: "dana@example.com", password: "nope" })).status, 401);
  const me = await call("GET", "/auth/me", undefined, { headers: { authorization: `Bearer ${res.body.accessToken}` } });
  assert.deepEqual(me.body, { id: 1, role: "user" });
});
test("טוקן מזויף נדחה", async (t) => {
  const { call } = await nestApp(t, AuthModule);
  const real = await new JwtService({ secret: JWT_SECRET }).signAsync({ sub: 1, role: "user" });
  const [h, , s] = real.split(".");
  const forged = `${h}.${Buffer.from(JSON.stringify({ sub: 1, role: "admin" })).toString("base64url")}.${s}`;
  const res = await call("GET", "/auth/me", undefined, { headers: { authorization: `Bearer ${forged}` } });
  assert.equal(res.status, 401, "payload שונה — חתימה לא תקינה");
  const other = await new JwtService({ secret: "attacker-secret-attacker-secret-0123" }).signAsync({ sub: 1, role: "admin" });
  assert.equal((await call("GET", "/auth/me", undefined, { headers: { authorization: `Bearer ${other}` } })).status, 401, "סוד אחר");
});
