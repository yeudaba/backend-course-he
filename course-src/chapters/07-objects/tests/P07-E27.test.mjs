import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P07-E27.js", ["createStock"]);

test("add ו־count", async () => {
  const { createStock } = await get();
  const s = createStock();
  assert.equal(s.count("pen"), 0, "פריט שלא קיים ← 0");
  s.add("pen", 5);
  s.add("pen", 2);
  assert.equal(s.count("pen"), 7);
});
test("take — כשיש מספיק", async () => {
  const { createStock } = await get();
  const s = createStock();
  s.add("pen", 5);
  assert.equal(s.take("pen", 2), true);
  assert.equal(s.count("pen"), 3);
  assert.equal(s.take("pen", 3), true, "לקחת את כל מה שיש — מותר");
  assert.equal(s.count("pen"), 0);
});
test("take — כשאין מספיק לא משנה כלום", async () => {
  const { createStock } = await get();
  const s = createStock();
  s.add("pen", 2);
  assert.equal(s.take("pen", 5), false);
  assert.equal(s.count("pen"), 2, "הכמות השתנתה למרות ש־take החזירה false");
  assert.equal(s.take("cup", 1), false, "פריט שלא קיים");
});
test("שני מלאים נפרדים", async () => {
  const { createStock } = await get();
  const a = createStock();
  const b = createStock();
  a.add("pen", 5);
  assert.equal(b.count("pen"), 0, "המלאי צריך להיווצר בתוך createStock, לא מחוץ לה");
});
test("המלאי לא חשוף מבחוץ", async () => {
  const { createStock } = await get();
  const s = createStock();
  s.add("pen", 1);
  assert.deepEqual(Object.keys(s).sort(), ["add", "count", "take"], "האובייקט שחוזר צריך לכלול רק את add, take ו־count");
});
