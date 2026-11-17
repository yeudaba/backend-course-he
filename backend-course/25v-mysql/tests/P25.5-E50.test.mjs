import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const EXTRA = `INSERT INTO products (name, category, price, stock, is_active, attributes) VALUES ('Kenya 500g', 'beans', 59.90, 13, TRUE, '{"roast": "light"}'), ('Decaf 1kg', 'beans', 79.00, 5, TRUE, NULL), ('Sumatra 1kg', 'beans', 92.10, 9, TRUE, '{"roast": "dark", "origin": "Indonesia"}'), ('Dark Mug', 'accessories', 30.00, 2, TRUE, '{"roast": "dark"}')`;
const FILE = "P25.5-E50.sql";

test("על נתוני היחידה", async (t) => {
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE);
  assert.ok(expected.length > 0);
  assert.deepEqual(Object.keys(got[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן");
  assert.deepEqual(got, expected);
});
test("עם עוד נתונים — כדי שתשובה קבועה לא תעבור", async (t) => {
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE, { extra: EXTRA });
  assert.deepEqual(got, expected);
});
