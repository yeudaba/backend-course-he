import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E44.js";
const get = () => exportsOf(import.meta.url, FILE, ["visit"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מוסיפה דף חדש לסוף, אחרי trim", async () => {
  const { visit } = await get();
  const h = ["/home"];
  const r = visit(h, " /cart ");
  assert.deepEqual(h, ["/home", "/cart"]);
  assert.equal(r, h, "מחזירה את אותו מערך שקיבלה");
});
test("רענון — אותו דף כמו האחרון", async () => {
  const { visit } = await get();
  const h = ["/home", "/products"];
  visit(h, "/products");
  visit(h, "  /products");
  assert.deepEqual(h, ["/home", "/products"]);
  visit(h, "/home");
  assert.deepEqual(h, ["/home", "/products", "/home"], "דף שהיה פעם — אבל לא האחרון — נוסף");
});
test("דף ריק לא משנה כלום", async () => {
  const { visit } = await get();
  const h = ["/a"];
  visit(h, "");
  visit(h, "   ");
  assert.deepEqual(h, ["/a"]);
  const empty = [];
  visit(empty, " ");
  assert.deepEqual(empty, []);
});
test("max — הישן ביותר נמחק", async () => {
  const { visit } = await get();
  const h = ["/1", "/2", "/3", "/4", "/5"];
  visit(h, "/6");
  assert.deepEqual(h, ["/2", "/3", "/4", "/5", "/6"], "ברירת מחדל: 5");
  const k = ["/a", "/b"];
  visit(k, "/c", 2);
  assert.deepEqual(k, ["/b", "/c"]);
  visit(k, "/d", 3);
  assert.deepEqual(k, ["/b", "/c", "/d"]);
});
