import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

async function setup(t) {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.runFile("P25.5-E06.sql");
  const cols = Object.fromEntries((await db.rows("SELECT COLUMN_NAME c, COLUMN_TYPE t, IS_NULLABLE n, EXTRA x, COLUMN_KEY k FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reviews'")).map((r) => [r.c, r]));
  return { db, cols };
}

test("עמודות וטיפוסים", async (t) => {
  const { cols } = await setup(t);
  assert.deepEqual(Object.keys(cols).sort(), ["body", "created_at", "customer_id", "id", "product_id", "rating"]);
  assert.match(cols.id.t, /^bigint unsigned$/);
  assert.match(cols.id.x, /auto_increment/);
  assert.equal(cols.id.k, "PRI");
  assert.match(cols.product_id.t, /^int unsigned$/, "כמו products.id — אחרת המפתח הזר לא נוצר");
  assert.match(cols.created_at.t, /^datetime\(3\)$/);
  for (const c of ["product_id", "customer_id", "rating", "body", "created_at"]) assert.equal(cols[c].n, "NO", `${c} NOT NULL`);
});
test("אמוג׳י נשמר; דירוג מחוץ לטווח, כפילות ומפתח זר — נדחים", async (t) => {
  const { db } = await setup(t);
  await db.query("INSERT INTO reviews (product_id, customer_id, rating, body) VALUES (1, 1, 5, 'מעולה ☕🔥')");
  assert.equal((await db.rows("SELECT body FROM reviews"))[0].body, "מעולה ☕🔥");
  await assert.rejects(db.query("INSERT INTO reviews (product_id, customer_id, rating, body) VALUES (2, 1, 6, 'x')"), /check constraint/i, "rating 6");
  await assert.rejects(db.query("INSERT INTO reviews (product_id, customer_id, rating, body) VALUES (1, 1, 4, 'again')"), /Duplicate/i, "ביקורת שנייה לאותו מוצר");
  await assert.rejects(db.query("INSERT INTO reviews (product_id, customer_id, rating, body) VALUES (999, 1, 4, 'x')"), /foreign key/i);
});
test("אינדקס ל'ביקורות של מוצר, מהחדשה'", async (t) => {
  const { db } = await setup(t);
  const idx = await db.rows("SELECT INDEX_NAME i, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) cols FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reviews' GROUP BY INDEX_NAME");
  assert.ok(idx.some((r) => r.cols === "product_id,created_at"), `אינדקסים: ${idx.map((r) => r.cols).join(" | ")}`);
  const [tbl] = await db.rows("SELECT TABLE_COLLATION c FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reviews'");
  assert.match(tbl.c, /^utf8mb4/);
});
