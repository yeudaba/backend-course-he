import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E61.js";
const get = () => exportsOf(import.meta.url, FILE, ["pick"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("רק השדות שביקשו", async () => {
  const { pick } = await get();
  const user = { id: 1, name: "דנה", passwordHash: "x9f", email: "d@m.com" };
  assert.deepEqual(pick(user, ["id", "name", "email"]), { id: 1, name: "דנה", email: "d@m.com" });
  assert.deepEqual(pick(user, ["email"]), { email: "d@m.com" });
});
test("שדה שלא קיים — לא נכנס", async () => {
  const { pick } = await get();
  assert.deepEqual(pick({ id: 1 }, ["id", "phone"]), { id: 1 });
  assert.deepEqual(pick({ a: undefined, b: null, c: 0 }, ["a", "b", "c"]), { b: null, c: 0 }, "null ו־0 הם ערכים; undefined לא");
  assert.deepEqual(pick({}, []), {});
});
test("אובייקט חדש, המקור לא משתנה", async () => {
  const { pick } = await get();
  const user = { id: 1, secret: "s" };
  const r = pick(user, ["id", "secret"]);
  assert.notEqual(r, user);
  assert.deepEqual(user, { id: 1, secret: "s" });
});
