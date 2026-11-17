import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const EXTRA = `INSERT INTO orders (customer_id, status, total, created_at) VALUES (5, 'shipped', 213.80, '2026-04-01 10:00:00'), (3, 'cancelled', 10.00, '2026-04-02 10:00:00'); INSERT INTO order_items VALUES (7, 3, 2, 29.90), (7, 8, 1, 149.00), (7, 9, 1, 4.90), (8, 9, 1, 10.00)`;
const FILE = "P25.5-E34.sql";

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
