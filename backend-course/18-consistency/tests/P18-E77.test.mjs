import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sandbox } from "../../tools/sql.mjs";

const solution = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "solutions", "P18-E77.sql");
const CHANGES = [
  ["bank.sql", ""],
  ["אחרי מחיקה והוספה של הזמנות", "DELETE FROM big_orders WHERE customer_id = 3; DELETE FROM big_orders WHERE customer_id = 5 AND id % 2 = 0; INSERT INTO big_orders (customer_id, status, total, created_at) VALUES (7, 'paid', 50, '2026-02-02 10:00+00')"],
];
for (const [label, change] of CHANGES) {
  test(`P18-E77: ${label}`, async (t) => {
    const db = await sandbox(t, import.meta.url, "bank.sql");
    if (change) await db.query(change);
    const got = await db.fileRows("P18-E77.sql");
    const expected = (await db.query(fs.readFileSync(solution, "utf8"))).rows;
    assert.deepEqual(Object.keys(got?.[0] ?? {}), ["id", "full_name", "orders", "last_order"]);
    assert.deepEqual(got, expected);
  });
}
