import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P12-E26.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["Inventory"])).Inventory;
const QTY_MSG = "כמות חייבת להיות מספר שלם חיובי";

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("add, ‏count ו־totalItems", async () => {
  const Inventory = await get();
  const inv = new Inventory();
  assert.equal(inv.count("pen"), 0, "פריט שלא קיים ← 0");
  assert.equal(inv.totalItems(), 0);
  inv.add("pen", 5);
  inv.add("pen", 2);
  inv.add("cup", 3);
  assert.equal(inv.count("pen"), 7);
  assert.equal(inv.totalItems(), 10);
});
test("remove — כשיש מספיק, ופריט שהגיע ל־0 נעלם", async () => {
  const Inventory = await get();
  const inv = new Inventory();
  inv.add("pen", 5);
  inv.add("cup", 2);
  inv.remove("pen", 2);
  assert.equal(inv.count("pen"), 3);
  inv.remove("cup", 2);
  assert.equal(inv.count("cup"), 0);
  assert.deepEqual(inv.skus(), ["pen"], "cup הגיע ל־0 — הוא לא צריך להופיע ב־skus()");
});
test("remove — כשאין מספיק: שגיאה, והמלאי לא משתנה", async () => {
  const Inventory = await get();
  const inv = new Inventory();
  inv.add("pen", 5);
  assert.throws(() => inv.remove("pen", 9), { message: "אין מספיק pen: יש 5, ביקשו 9" });
  assert.equal(inv.count("pen"), 5, "המלאי השתנה למרות השגיאה — קודם בודקים, אחר כך משנים");
  assert.throws(() => inv.remove("ghost", 1), { message: "אין מספיק ghost: יש 0, ביקשו 1" });
});
test("כמות לא תקינה — RangeError", async () => {
  const Inventory = await get();
  const inv = new Inventory();
  inv.add("pen", 1);
  for (const bad of [0, -1, 1.5, NaN]) {
    assert.throws(() => inv.add("pen", bad), (e) => e instanceof RangeError && e.message === QTY_MSG, `add("pen", ${bad}) צריכה לזרוק RangeError("${QTY_MSG}")`);
    assert.throws(() => inv.remove("pen", bad), (e) => e instanceof RangeError && e.message === QTY_MSG, `remove("pen", ${bad}) צריכה לזרוק RangeError("${QTY_MSG}")`);
  }
  assert.equal(inv.count("pen"), 1);
});
test("skus ממוינים", async () => {
  const Inventory = await get();
  const inv = new Inventory();
  for (const sku of ["mug", "box", "pen", "cap"]) inv.add(sku, 1);
  assert.deepEqual(inv.skus(), ["box", "cap", "mug", "pen"]);
});
test("שני מחסנים נפרדים, והנתונים לא חשופים", async () => {
  const Inventory = await get();
  const a = new Inventory();
  const b = new Inventory();
  a.add("pen", 3);
  assert.equal(b.count("pen"), 0, "המלאי של b מושפע מ־a");
  assert.deepEqual(Object.keys(a), [], `יש שדות ציבוריים (${Object.keys(a).join(", ")}) — השתמש בשדה פרטי עם #`);
});
