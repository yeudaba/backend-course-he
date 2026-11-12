import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import bcrypt from "bcryptjs";
import { listen, api } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

test("login", async (t) => {
  const { loginRouter } = await exportsOf(import.meta.url, "P25.7-E98.ts", ["loginRouter"]);
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await db.collection("users").insertMany([
    { _id: "u1", email: "admin@example.com", passwordHash: bcrypt.hashSync("admin-pass-123", 4) },
    { _id: "u2", email: "dana@example.com", passwordHash: bcrypt.hashSync("long-password-1", 4) },
  ]);
  const app = express();
  app.use(express.json());
  app.use(loginRouter(db));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  const ok = await call("POST", "/login", { email: " Dana@example.com", password: "long-password-1" });
  assert.deepEqual([ok.status, ok.body], [200, { id: "u2", email: "dana@example.com" }]);
  for (const b of [{ email: "dana@example.com", password: "wrong" }, { email: "nobody@example.com", password: "long-password-1" }]) {
    const r = await call("POST", "/login", b);
    assert.deepEqual([r.status, r.body], [401, { error: { code: "INVALID_CREDENTIALS" } }]);
  }
  for (const b of [{ email: { $ne: "x" }, password: "admin-pass-123" }, { email: "admin@example.com", password: { $ne: null } }, {}]) {
    const r = await call("POST", "/login", b);
    assert.deepEqual([r.status, r.body?.error?.code], [400, "VALIDATION_ERROR"], JSON.stringify(b));
  }
});
