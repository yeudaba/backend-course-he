import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";
import { duck } from "./_duck.mjs";

const { syncOrders, lakeReport } = await load(import.meta.url, "P28.5-E25.ts");

async function setup(t) {
  const db = await sandbox(t, import.meta.url, "lake.sql");
  const d = await duck(t);
  const lakeDir = fs.mkdtempSync(path.join(os.tmpdir(), "e25-"));
  t.after(() => fs.rmSync(lakeDir, { recursive: true, force: true }));
  const pool = db.pool(2);
  const truth = async () =>
    (await db.rows(`SELECT to_char(created_at AT TIME ZONE 'Asia/Jerusalem', 'YYYY-MM-DD') AS day, count(*)::int AS orders, (sum(total_cents) / 100.0)::float AS revenue
                    FROM orders WHERE status <> 'cancelled' GROUP BY 1 ORDER BY 1`));
  return { db, d, lakeDir, pool, truth };
}
const parts = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith(".parquet")).sort();

test("סנכרון ראשון: הכול, לקובץ אחד; שני — אין חדש, אין קובץ", async (t) => {
  const { d, lakeDir, pool, truth } = await setup(t);
  const r1 = await syncOrders({ pool, conn: d.conn, lakeDir });
  assert.equal(r1.exported, 40);
  assert.deepEqual(parts(lakeDir), ["part-00001.parquet"]);
  assert.deepEqual(await syncOrders({ pool, conn: d.conn, lakeDir }), { exported: 0, file: null });
  assert.deepEqual(parts(lakeDir), ["part-00001.parquet"]);
  assert.deepEqual(await lakeReport(d.conn, lakeDir), await truth());
});
test("עדכונים והזמנות חדשות ← רק השינויים; הדוח לוקח את הגרסה האחרונה", async (t) => {
  const { db, d, lakeDir, pool, truth } = await setup(t);
  await syncOrders({ pool, conn: d.conn, lakeDir });
  await db.query("UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id IN (3, 4, 5)");
  await db.query("UPDATE orders SET total_cents = total_cents + 500, updated_at = now() WHERE id IN (10, 11)");
  await db.query(`INSERT INTO orders (customer_id, total_cents, status, created_at, updated_at) VALUES (1, 4200, 'paid', '2026-10-20 10:00+00', now()), (2, 990, 'paid', '2026-10-20 22:30+00', now())`);
  const r = await syncOrders({ pool, conn: d.conn, lakeDir });
  assert.equal(r.exported, 7, "3 בוטלו + 2 עודכנו + 2 חדשות");
  assert.deepEqual(parts(lakeDir), ["part-00001.parquet", "part-00002.parquet"]);
  assert.deepEqual(await lakeReport(d.conn, lakeDir), await truth(), "הזמנה שהופיעה פעמיים בקבצים נספרה פעמיים?");
});
test("שורות עם אותו updated_at בין עמודים — אף אחת לא הולכת לאיבוד", async (t) => {
  const { db, d, lakeDir, pool, truth } = await setup(t);
  await syncOrders({ pool, conn: d.conn, lakeDir, pageSize: 7 });
  await db.query("UPDATE orders SET total_cents = total_cents + 1, updated_at = '2026-11-08 12:00+00' WHERE id BETWEEN 1 AND 20");
  const r = await syncOrders({ pool, conn: d.conn, lakeDir, pageSize: 3 });
  assert.equal(r.exported, 20, "20 שורות עם אותו updated_at, בעמודים של 3");
  assert.deepEqual(await lakeReport(d.conn, lakeDir), await truth());
});
