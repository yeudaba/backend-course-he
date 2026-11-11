import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E34.js";
const get = () => exportsOf(import.meta.url, FILE, ["makeUser"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שלושה שדות", async () => {
  const { makeUser } = await get();
  assert.deepEqual(makeUser("  דנה ", 31), { name: "דנה", age: 31, isAdult: true });
  assert.deepEqual(makeUser("נועה", 17), { name: "נועה", age: 17, isAdult: false });
});
test("גיל 18 בדיוק", async () => {
  const { makeUser } = await get();
  assert.equal(makeUser("x", 18).isAdult, true);
});
test("אובייקט חדש בכל קריאה", async () => {
  const { makeUser } = await get();
  assert.notEqual(makeUser("a", 1), makeUser("a", 1));
});
