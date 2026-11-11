import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P06-E28.js", ["priceList"]);

test("הדוגמה מהמשימה", async () => {
  const { priceList } = await get();
  assert.deepEqual(priceList(["Keyboard", "Mouse", "Mechanical keyboard RGB"], [199, 89.9, 450]), [
    "Keyboard..........199.00",
    "Mouse..............89.90",
    "Mechanical keyb…..450.00",
    "TOTAL.............738.90",
  ]);
});
test("כל שורה באורך 24", async () => {
  const { priceList } = await get();
  for (const row of priceList(["A", "1234567890123456", "12345678901234567"], [1, 1234.5, 0.1])) {
    assert.equal(row.length, 24, `השורה "${row}" באורך ${row.length}`);
  }
});
test("שם באורך 16 בדיוק לא נחתך, 17 כן", async () => {
  const { priceList } = await get();
  const [a, b] = priceList(["1234567890123456", "12345678901234567"], [5, 5]);
  assert.equal(a, "1234567890123456....5.00");
  assert.equal(b, "123456789012345…....5.00");
});
test("מחירון ריק — רק TOTAL של 0", async () => {
  const { priceList } = await get();
  assert.deepEqual(priceList([], []), ["TOTAL...............0.00"]);
});
test("לא משנה את המערכים שקיבלה", async () => {
  const { priceList } = await get();
  const names = ["Pen"];
  const prices = [3];
  priceList(names, prices);
  assert.deepEqual(names, ["Pen"]);
  assert.deepEqual(prices, [3]);
});
