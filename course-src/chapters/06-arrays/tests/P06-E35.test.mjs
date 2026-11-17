import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E35.js";
const get = () => exportsOf(import.meta.url, FILE, ["addTag"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מוסיפה תגית חדשה לסוף ומחזירה true", async () => {
  const { addTag } = await get();
  const tags = ["node"];
  assert.equal(addTag(tags, "api"), true);
  assert.deepEqual(tags, ["node", "api"], "התגית צריכה להתווסף לסוף המערך שקיבלת");
  assert.equal(addTag(tags, "sql"), true);
  assert.deepEqual(tags, ["node", "api", "sql"]);
});
test("תגית קיימת — false, והמערך לא משתנה", async () => {
  const { addTag } = await get();
  const tags = ["node", "api"];
  assert.equal(addTag(tags, "node"), false);
  assert.equal(addTag(tags, "api"), false);
  assert.deepEqual(tags, ["node", "api"]);
});
test("מערך ריק", async () => {
  const { addTag } = await get();
  const tags = [];
  assert.equal(addTag(tags, "x"), true);
  assert.deepEqual(tags, ["x"]);
});
