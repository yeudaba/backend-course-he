import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E92.ts", ["findUserForLogin"])).findUserForLogin;

test("מוצא לפי email בלבד", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await db.collection("users").insertMany([{ _id: "u1", email: "admin@example.com", passwordHash: "h1", role: "admin" }, { _id: "u2", email: "dana@example.com", passwordHash: "h2" }]);
  assert.deepEqual(await f(db, { email: "  Dana@Example.com ", password: "x" }), { id: "u2", email: "dana@example.com", passwordHash: "h2" });
  assert.equal(await f(db, { email: "nobody@example.com", password: "x" }), null);
});
test("injection — בלי לגעת במסד", async (t) => {
  const f = await get();
  let touched = false;
  const fakeDb = { collection: () => { touched = true; throw new Error("לא אמור לפנות למסד"); } };
  for (const b of [{ email: { $ne: "nobody" }, password: "x" }, { email: "a@b.c", password: { $ne: null } }, { email: "a@b.c", password: "" }, { email: "a@b.c" }, { email: "a@b.c", password: "x", role: "admin" }, null, "x"]) {
    await assert.rejects(f(fakeDb, b), { message: "VALIDATION_ERROR" }, JSON.stringify(b));
  }
  assert.equal(touched, false);
});
