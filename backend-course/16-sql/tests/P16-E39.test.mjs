import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E39.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["select"])).select;
const rows = () => [
  { id: 5, name: "Hand Grinder", category: "grinders", price: 189, is_active: true },
  { id: 6, name: "Electric Grinder Pro", category: "grinders", price: 649, is_active: true },
  { id: 7, name: "French Press 1L", category: "brewing", price: 119, is_active: false },
];
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("SELECT ו־WHERE", async () => {
  const select = await get();
  assert.deepEqual(select(rows(), ["name", "price"], { category: "grinders" }), [{ name: "Hand Grinder", price: 189 }, { name: "Electric Grinder Pro", price: 649 }]);
  assert.deepEqual(select(rows(), ["price", "id"]), [{ price: 189, id: 5 }, { price: 649, id: 6 }, { price: 119, id: 7 }], "בלי where — כל השורות, בסדר העמודות שביקשו");
  assert.deepEqual(Object.keys(select(rows(), ["price", "id"])[0]), ["price", "id"]);
  assert.deepEqual(select(rows(), ["id"], { category: "grinders", price: 649 }), [{ id: 6 }], "כל התנאים (AND)");
  assert.deepEqual(select(rows(), ["id"], { is_active: false }), [{ id: 7 }]);
  assert.deepEqual(select(rows(), ["id"], { price: "649" }), [], "=== — מחרוזת לא שווה למספר");
  assert.deepEqual(select([], ["x"], { y: 1 }), [], "טבלה ריקה");
});
test("לא משנה את הקלט", async () => {
  const select = await get();
  const input = rows();
  const out = select(input, ["id", "name", "category", "price", "is_active"]);
  out[0].name = "שונה";
  assert.equal(input[0].name, "Hand Grinder", "מחזירה אובייקטים חדשים");
});
test("עמודה שלא קיימת", async () => {
  const select = await get();
  assert.throws(() => select(rows(), ["nmae"]), { message: 'column "nmae" does not exist' });
  assert.throws(() => select(rows(), ["name"], { categroy: "x" }), { message: 'column "categroy" does not exist' });
});
