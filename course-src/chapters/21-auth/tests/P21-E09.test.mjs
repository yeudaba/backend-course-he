import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import { JwtService } from "@nestjs/jwt";

const { AuthModule, JWT_SECRET } = loadNest(import.meta.url, "P21-E09.ts");

test("כניסה מוצלחת ← JWT חתום", async (t) => {
  const { call } = await nestApp(t, AuthModule);
  const res = await call("POST", "/auth/login", { email: "dana@example.com", password: "dana-password-1" });
  assert.equal(res.status, 200);
  assert.equal(res.body.tokenType, "Bearer");
  assert.equal(res.body.expiresIn, 900);
  const payload = await new JwtService({ secret: JWT_SECRET }).verifyAsync(res.body.accessToken);
  assert.equal(payload.sub, 1);
  assert.equal(payload.role, "user");
  assert.equal(payload.exp - payload.iat, 900);
  assert.equal(payload.email, undefined, "רק מה שצריך ב־payload");
  const admin = await call("POST", "/auth/login", { email: "admin@example.com", password: "admin-password-1" });
  assert.equal((await new JwtService({ secret: JWT_SECRET }).verifyAsync(admin.body.accessToken)).role, "admin");
});
test("כניסה כושלת — אותה תשובה", async (t) => {
  const { call } = await nestApp(t, AuthModule);
  const wrong = await call("POST", "/auth/login", { email: "dana@example.com", password: "nope-nope" });
  const unknown = await call("POST", "/auth/login", { email: "ghost@example.com", password: "nope-nope" });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual(wrong.body, unknown.body);
  assert.equal(wrong.body.message, "אימייל או סיסמה שגויים");
});
