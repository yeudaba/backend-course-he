import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const EXTRA = `INSERT INTO orders (customer_id, status, total, created_at) VALUES (5, 'paid', 11.00, '2026-03-04 16:45:00'), (5, 'paid', 12.00, '2026-03-02 11:30:00'), (4, 'paid', 13.00, '2026-03-05 00:00:00'); UPDATE orders SET created_at = '2026-03-04 16:45:00' WHERE id = 3`;
const FILE = "P25.5-E54.sql";

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
