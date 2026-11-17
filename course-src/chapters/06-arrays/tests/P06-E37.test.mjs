import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E37.js";
const get = () => exportsOf(import.meta.url, FILE, ["roleLevel","canAccess"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("roleLevel", async () => {
  const { roleLevel } = await get();
  assert.equal(roleLevel("viewer"), 0);
  assert.equal(roleLevel("editor"), 1);
  assert.equal(roleLevel("admin"), 2);
  assert.equal(roleLevel("owner"), -1);
  assert.equal(roleLevel("Admin"), -1, "השוואה מדויקת — Admin הוא לא admin");
});
test("canAccess — תפקידים מוכרים", async () => {
  const { canAccess } = await get();
  assert.equal(canAccess("admin", "editor"), true);
  assert.equal(canAccess("viewer", "editor"), false);
  assert.equal(canAccess("editor", "editor"), true);
  assert.equal(canAccess("viewer", "viewer"), true);
  assert.equal(canAccess("editor", "admin"), false);
});
test("canAccess — תפקיד לא מוכר ← false", async () => {
  const { canAccess } = await get();
  assert.equal(canAccess("owner", "viewer"), false);
  assert.equal(canAccess("viewer", "owner"), false, "דרישה לתפקיד שלא קיים — אסור לתת גישה");
  assert.equal(canAccess("admin", "superuser"), false);
});
