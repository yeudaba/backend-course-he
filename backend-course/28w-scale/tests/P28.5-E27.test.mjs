import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const FILE = "P28.5-E27.sql";
const norm = (rows) => rows.map((r) => [String(r.day instanceof Date ? r.day.toISOString().slice(0, 10) : r.day).slice(0, 10), Number(r.views), Number(r.users), r.top_path, Number(r.top_path_views)]);

test("P28.5-E27: סיכום יומי (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "views-days.sql");
  const got = await db.fileRows(FILE);
  assert.deepEqual(Object.keys(got?.[0] ?? {}), ["day", "views", "users", "top_path", "top_path_views"], "שמות העמודות והסדר שלהן");
  const rows = norm(got);
  assert.deepEqual(rows.map((r) => r[2]), [3, 3, 4], "users — משתמשים שונים (COUNT(DISTINCT user_id)), לא צפיות");
  assert.equal(rows[1][3], "/cart", "2 בנובמבר: /cart ו־/checkout עם 2 צפיות כל אחד — בתיקו לפי שם הנתיב");
  assert.deepEqual(rows, norm(await db.expectedRows(FILE)));
});
test("P28.5-E27: יום עם צפייה אחת, ונתיב שמוביל ביום אחר", async (t) => {
  const db = await sandbox(t, import.meta.url, "views-days.sql");
  await db.query("INSERT INTO page_views (user_id, path, viewed_at) VALUES (9, '/zzz', '2026-11-04 11:00:00+00'), (1, '/checkout', '2026-11-02 11:30:00+00')");
  const rows = norm(await db.fileRows(FILE));
  assert.deepEqual(rows[1], ["2026-11-02", 6, 3, "/checkout", 3], "צפייה נוספת ב־/checkout — עכשיו הוא מוביל");
  assert.deepEqual(rows[3], ["2026-11-04", 1, 1, "/zzz", 1]);
});
