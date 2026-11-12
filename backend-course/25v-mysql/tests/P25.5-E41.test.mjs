import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const EXTRA = `INSERT INTO orders (customer_id, status, total, created_at) VALUES (5, 'shipped', 100.00, '2026-04-01 10:00:00'), (5, 'paid', 50.50, '2026-04-30 23:59:59'), (3, 'cancelled', 999.00, '2026-04-02 10:00:00'), (1, 'paid', 10.00, '2025-12-31 23:00:00'), (2, 'paid', 33.33, '2027-03-15 08:00:00')`;
const FILE = "P25.5-E41.sql";

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
