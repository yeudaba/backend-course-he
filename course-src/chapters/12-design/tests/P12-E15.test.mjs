import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { UserService, InMemoryUserRepository, ConflictError, NotFoundError, ValidationError } = await load(import.meta.url, "P12-E15.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E15.ts"); assert.ok(r.ok, r.output); });
test("register", async () => { const s = new UserService(new InMemoryUserRepository()); assert.deepEqual(await s.register({ email: " Dana@X.com", name: " דנה " }), { id: 1, email: "dana@x.com", name: "דנה" }); assert.equal((await s.register({ email: "b@x", name: "b" })).id, 2); });
test("כפילות", async () => { const s = new UserService(new InMemoryUserRepository()); await s.register({ email: "a@x", name: "a" }); await assert.rejects(s.register({ email: "A@X", name: "b" }), ConflictError); });
test("getById ו־rename", async () => {
  const s = new UserService(new InMemoryUserRepository());
  await s.register({ email: "a@x", name: "a" });
  await assert.rejects(s.getById(9), { message: "משתמש 9 לא נמצא" });
  assert.equal((await s.rename(1, " חדש ")).name, "חדש");
  assert.equal((await s.getById(1)).name, "חדש");
  await assert.rejects(s.rename(1, " "), ValidationError);
});
test("עובד עם כל repository (DI)", async () => { const calls = []; const fake = { findById: async () => null, findByEmail: async () => null, count: async () => 41, save: async (u) => calls.push(u) }; const u = await new UserService(fake).register({ email: "z@z", name: "z" }); assert.equal(u.id, 42); assert.equal(calls.length, 1); });
