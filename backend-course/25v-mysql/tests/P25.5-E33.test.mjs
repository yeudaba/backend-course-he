import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const EXTRA = `INSERT INTO products (name, category, price, stock, is_active) VALUES ('Kenya Beans 500g', 'beans', 59.90, 13, TRUE), ('Guatemala Beans 1kg', 'beans', 94.50, 6, TRUE), ('Tamper', 'accessories', 79.00, 4, TRUE)`;
const FILE = "P25.5-E33.sql";

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
