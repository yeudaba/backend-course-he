import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E52.js";
const get = () => exportsOf(import.meta.url, FILE, ["assertShape"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const shape = { name: "string", price: "number", inStock: "boolean" };
test("תקין ← true", async () => {
  const { assertShape } = await get();
  assert.equal(assertShape({ name: "עט", price: 5, inStock: true }, shape), true);
  assert.equal(assertShape({ name: "עט", price: 5, inStock: false, extra: 1 }, shape), true, "שדות נוספים מותרים");
  assert.equal(assertShape({}, {}), true);
});
test("סוג שגוי", async () => {
  const { assertShape } = await get();
  assert.throws(() => assertShape({ name: "עט", price: "5", inStock: true }, shape), { message: "price: ציפינו ל־number וקיבלנו string", field: "price", status: 400 });
  assert.throws(() => assertShape({ name: 7, price: 5, inStock: true }, shape), { message: "name: ציפינו ל־string וקיבלנו number", field: "name" });
});
test("שדה חסר", async () => {
  const { assertShape } = await get();
  assert.throws(() => assertShape({ name: "עט", inStock: true }, shape), { message: "price: ציפינו ל־number וקיבלנו undefined", field: "price", status: 400 });
});
test("הבעיה הראשונה לפי הסדר ב־shape", async () => {
  const { assertShape } = await get();
  assert.throws(() => assertShape({ inStock: "yes", price: "x" }, shape), { field: "name" });
  assert.throws(() => assertShape({ name: "a", inStock: "yes", price: "x" }, shape), { field: "price" });
});
test("זורקת Error", async () => {
  const { assertShape } = await get();
  try {
    assertShape({}, { a: "string" });
    assert.fail("ציפינו לשגיאה");
  } catch (err) {
    assert.ok(err instanceof Error, "צריך throw new Error(...)");
  }
});
