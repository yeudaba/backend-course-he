import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E44.js";
const get = () => exportsOf(import.meta.url, FILE, ["parseSettings"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("פירוק רגיל", async () => {
  const { parseSettings } = await get();
  assert.deepEqual(parseSettings("name=Dana; age=31 ;city=Haifa"), { name: "Dana", age: "31", city: "Haifa" });
  assert.deepEqual(parseSettings("x=1"), { x: "1" });
});
test("זוגות שבורים — מדלגים", async () => {
  const { parseSettings } = await get();
  assert.deepEqual(parseSettings("a=1;;broken; =x"), { a: "1" });
  assert.deepEqual(parseSettings(""), {});
  assert.deepEqual(parseSettings(";;;"), {});
});
test("שם שחוזר — האחרון קובע; ערך ריק מותר", async () => {
  const { parseSettings } = await get();
  assert.deepEqual(parseSettings("a=1; a=2"), { a: "2" });
  assert.deepEqual(parseSettings("empty="), { empty: "" });
});
test("ערך עם =", async () => {
  const { parseSettings } = await get();
  assert.deepEqual(parseSettings("q=a=b"), { q: "a=b" });
  assert.deepEqual(parseSettings("token=abc==; user=x"), { token: "abc==", user: "x" });
});
