import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import bcrypt from "bcryptjs";

const { AuthModule, UsersService, BCRYPT_ROUNDS } = loadNest(import.meta.url, "P21-E08.ts");
const start = (t) => nestApp(t, AuthModule, { validation: true, overrides: [[BCRYPT_ROUNDS, 4]] });

test("הרשמה", async (t) => {
  const { call, moduleRef } = await start(t);
  const res = await call("POST", "/auth/register", { email: "  Dana@Example.com ", password: "long-password-1" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, email: "dana@example.com", role: "user" }, "בלי passwordHash, אימייל מנורמל");
  const stored = moduleRef.get(UsersService).findByEmail("dana@example.com");
  assert.ok(stored, "findByEmail מוצא");
  assert.notEqual(stored.passwordHash, "long-password-1");
  assert.match(stored.passwordHash, /^\$2[aby]\$04\$/, "bcrypt עם BCRYPT_ROUNDS");
  assert.ok(await bcrypt.compare("long-password-1", stored.passwordHash));
});
test("כפילות ו־mass assignment", async (t) => {
  const { call } = await start(t);
  await call("POST", "/auth/register", { email: "dana@example.com", password: "long-password-1" });
  let res = await call("POST", "/auth/register", { email: "DANA@example.com", password: "other-password" });
  assert.equal(res.status, 409);
  assert.equal(res.body.message, "האימייל כבר רשום");
  res = await call("POST", "/auth/register", { email: "evil@example.com", password: "long-password-1", role: "admin" });
  assert.equal(res.status, 400, "role בגוף ← 400");
  assert.ok(res.body.message.includes("property role should not exist"));
  assert.equal((await call("POST", "/auth/register", { email: "nope", password: "long-password-1" })).status, 400);
  assert.equal((await call("POST", "/auth/register", { email: "ok@example.com", password: "short" })).status, 400);
});
