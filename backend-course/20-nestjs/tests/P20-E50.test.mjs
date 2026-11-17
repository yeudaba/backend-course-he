import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("הרשמה, ולידציה ו־409", async (t) => {
  const { SignupModule } = exportsOf(import.meta.url, "P20-E50.ts", ["SignupModule", "SignupDto", "UsersService", "SignupController"]);
  const { call } = await nestApp(t, SignupModule, { validation: true });
  const r = await call("POST", "/signup", { email: "Dana@Example.com", password: "secret123", displayName: "Dana" });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { id: 1, email: "dana@example.com", displayName: "Dana" }, "בלי password, אימייל באותיות קטנות");
  assert.deepEqual((await call("POST", "/signup", { email: "yossi@example.com", password: "12345678" })).body, { id: 2, email: "yossi@example.com", displayName: null });
  const dup = await call("POST", "/signup", { email: "DANA@example.com", password: "another1" });
  assert.equal(dup.status, 409);
  assert.equal(dup.body?.message, "האימייל כבר רשום");
  const noDigit = await call("POST", "/signup", { email: "a@b.co", password: "abcdefgh" });
  assert.equal(noDigit.status, 400);
  assert.ok(noDigit.body.message.includes("password חייב לכלול ספרה"), JSON.stringify(noDigit.body));
  for (const body of [{ email: "nope", password: "secret123" }, { email: "a@b.co", password: "short1" }, { email: "a@b.co", password: "secret123", displayName: "D" }, { email: "a@b.co", password: "secret123", isAdmin: true }, { password: "secret123" }]) {
    assert.equal((await call("POST", "/signup", body)).status, 400, JSON.stringify(body));
  }
  assert.deepEqual((await call("POST", "/signup", { email: "noa@example.com", password: "secret123" })).body.id, 3, "בקשות שנכשלו לא יצרו משתמשים");
});
