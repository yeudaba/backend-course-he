import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const EXTRA = `INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'shipped', 50.00, '2026-03-01 09:00:00'), (5, 'paid', 70.00, '2026-03-10 10:00:00'), (5, 'paid', 30.00, '2026-03-11 10:00:00'), (3, 'cancelled', 5.00, '2026-03-12 10:00:00')`;
const FILE = "P25.5-E49.sql";

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
