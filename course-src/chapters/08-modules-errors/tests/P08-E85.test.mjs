import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E85.js";
const get = () => exportsOf(import.meta.url, FILE, ["snakeToCamel", "camelToSnake"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("snakeToCamel", async () => {
  const { snakeToCamel } = await get();
  assert.equal(snakeToCamel("created_at_utc"), "createdAtUtc");
  assert.equal(snakeToCamel("user_id"), "userId");
  assert.equal(snakeToCamel("id"), "id");
  assert.equal(snakeToCamel("a_b_c_d"), "aBCD", "כל _ ולא רק הראשון (g)");
});
test("camelToSnake", async () => {
  const { camelToSnake } = await get();
  assert.equal(camelToSnake("orderItemsCount"), "order_items_count");
  assert.equal(camelToSnake("userId"), "user_id");
  assert.equal(camelToSnake("id"), "id");
  assert.equal(camelToSnake("aBCD"), "a_b_c_d", "כל אות גדולה ולא רק הראשונה (g)");
});
test("הלוך וחזור", async () => {
  const { snakeToCamel, camelToSnake } = await get();
  for (const name of ["created_at", "order_items_count", "total", "x_y"]) {
    assert.equal(camelToSnake(snakeToCamel(name)), name);
  }
});
test("עם replace ו־regex", () => {
  assert.match(src(), /\.replace\s*\(\s*\//, "השתמש ב־replace עם regex");
});
