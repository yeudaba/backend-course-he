import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sandbox } from "../../tools/sql.mjs";
import { plan, lastStatement } from "./_helpers.mjs";
import { target } from "../../tools/load.mjs";

const reference = `SELECT id, created_at, total FROM big_orders
  WHERE created_at < '2025-06-01 12:00:00+00' OR (created_at = '2025-06-01 12:00:00+00' AND id < 100000)
  ORDER BY created_at DESC, id DESC LIMIT 10`;

test("P18-E74: העמוד הבא", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query(`INSERT INTO big_orders (customer_id, status, total, created_at) VALUES
    (1, 'paid', 11, '2025-06-01 12:00:00+00'), (2, 'paid', 12, '2025-06-01 12:00:00+00'), (3, 'paid', 13, '2025-06-01 11:59:59+00')`);
  await db.query("UPDATE big_orders SET created_at = '2025-06-01 12:00:00+00' WHERE id IN (99990, 100005, 99000)");
  const got = await db.fileRows("P18-E74.sql");
  const expected = await db.rows(reference);
  assert.deepEqual(Object.keys(got?.[0] ?? {}), ["id", "created_at", "total"], "העמודות: id, created_at, total");
  assert.deepEqual(got, expected, "העמוד הבא — כולל שורות באותו רגע בדיוק עם id קטן יותר");
  const query = lastStatement(fs.readFileSync(target(import.meta.url, "P18-E74.sql"), "utf8"));
  const p = await plan(db, query);
  assert.doesNotMatch(p, /Seq Scan/, `בלי Seq Scan. התוכנית:\n${p}`);
  assert.doesNotMatch(p, /Sort/, `בלי שלב מיון — ה־index צריך להתאים ל־ORDER BY. התוכנית:\n${p}`);
});
