import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E35.js";
const get = () => exportsOf(import.meta.url, FILE, ["fieldOr"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שדה קיים", async () => {
  const { fieldOr } = await get();
  assert.equal(fieldOr({ theme: "dark" }, "theme", "light"), "dark");
  assert.equal(fieldOr({ a: 1, b: 2 }, "b", 0), 2);
});
test("0, \"\" ו־false הם ערכים", async () => {
  const { fieldOr } = await get();
  assert.equal(fieldOr({ fontSize: 0 }, "fontSize", 14), 0, "0 הוא ערך אמיתי — השתמש ב־?? ולא ב־||");
  assert.equal(fieldOr({ nick: "" }, "nick", "x"), "");
  assert.equal(fieldOr({ on: false }, "on", true), false);
});
test("חסר או null ← fallback", async () => {
  const { fieldOr } = await get();
  assert.equal(fieldOr({ lang: null }, "lang", "he"), "he");
  assert.equal(fieldOr({}, "missing", "x"), "x");
});
