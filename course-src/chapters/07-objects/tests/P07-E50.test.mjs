import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E50.js";
const get = () => exportsOf(import.meta.url, FILE, ["findByEmail"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מוצא בלי תלות באותיות וברווחים", async () => {
  const { findByEmail } = await get();
  const users = [{ id: 1, email: "dana@mail.com" }, { id: 2, email: "omer@mail.com" }];
  assert.equal(findByEmail(users, " Dana@Mail.com "), users[0], "מחזירה את האובייקט מתוך המערך");
  assert.equal(findByEmail(users, "omer@mail.com"), users[1]);
});
test("לא נמצא ← null", async () => {
  const { findByEmail } = await get();
  assert.equal(findByEmail([{ id: 1, email: "a@b.c" }], "x@mail.com"), null);
  assert.equal(findByEmail([], "a@b.c"), null);
});
