import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { migrate } = await load(import.meta.url, "P19.5-E19.ts");
const migrations = [
  { id: "002_add_rating", sql: "ALTER TABLE reviews_m ADD COLUMN rating TINYINT NOT NULL DEFAULT 5" },
  { id: "001_create_reviews", sql: "CREATE TABLE reviews_m (id INT AUTO_INCREMENT PRIMARY KEY, body TEXT)" },
];

test("לפי סדר ה־id, ופעם אחת", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(3);
  assert.deepEqual(await migrate(pool, migrations), ["001_create_reviews", "002_add_rating"]);
  assert.deepEqual(await migrate(pool, migrations), []);
  assert.deepEqual((await db.rows("SELECT id FROM schema_migrations ORDER BY id")).map((r) => r.id), ["001_create_reviews", "002_add_rating"]);
});
test("שלושה 'שרתים' במקביל — כל migration פעם אחת (GET_LOCK)", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(6);
  const ran = (await Promise.all([migrate(pool, migrations), migrate(pool, migrations), migrate(pool, migrations)])).flat();
  assert.deepEqual(ran.sort(), ["001_create_reviews", "002_add_rating"]);
  const [{ n }] = await db.rows("SELECT IS_FREE_LOCK('schema_migrations') n");
  assert.equal(n, 1, "הנעילה שוחררה");
});
test("migration שנכשל — עוצר, ולא נרשם", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(2);
  await assert.rejects(migrate(pool, [...migrations, { id: "003_bad", sql: "ALTER TABLE nope ADD x INT" }]));
  assert.deepEqual((await db.rows("SELECT id FROM schema_migrations ORDER BY id")).map((r) => r.id), ["001_create_reviews", "002_add_rating"]);
  const [{ n }] = await db.rows("SELECT IS_FREE_LOCK('schema_migrations') n");
  assert.equal(n, 1, "גם אחרי שגיאה — הנעילה משתחררת");
});
