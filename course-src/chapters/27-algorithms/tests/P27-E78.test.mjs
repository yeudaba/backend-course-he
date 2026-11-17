import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("סכום מצטבר של ששולמו, לכל לקוח", async (t) => {
  const db = await sandbox(t, import.meta.url, "interview.sql");
  await db.query("INSERT INTO orders (customer_id, total, status, created_on) VALUES (6, 10.00, 'paid', '2026-10-09')");
  const rows = (await db.fileRows("P27-E78.sql")).map((r) => [r.customer_id, r.id, r.created_on, r.total, r.running_total]);
  assert.deepEqual(rows, [
    [1, 1, "2026-10-01", 189, 189],
    [1, 10, "2026-10-12", 99, 288],
    [2, 2, "2026-10-01", 89.9, 89.9],
    [2, 5, "2026-10-05", 119, 208.9],
    [4, 4, "2026-10-03", 649, 649],
    [4, 8, "2026-10-08", 29.9, 678.9],
    [6, 6, "2026-10-05", 39, 39],
    [6, 9, "2026-10-09", 249, 288],
    [6, 11, "2026-10-09", 10, 298],
  ]);
});
