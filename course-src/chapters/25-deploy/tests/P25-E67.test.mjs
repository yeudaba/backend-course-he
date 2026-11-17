import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25-E67.ts", ["expand", "contract"]);
const columns = async (db) => (await db.rows("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'tasks' ORDER BY ordinal_position", [db.schema])).map((r) => `${r.column_name}:${r.is_nullable}`);

test("expand — עמודה חדשה, ממולאת; פעמיים — בטוח", async (t) => {
  const { expand } = await get();
  const db = await sandbox(t, import.meta.url, "rename.sql");
  const pool = db.pool(2);
  assert.equal(await expand(pool), 3);
  assert.deepEqual(await columns(db), ["id:NO", "title:NO", "done:NO", "name:YES"]);
  assert.deepEqual((await db.rows("SELECT name FROM tasks ORDER BY id")).map((r) => r.name), ["לקנות חלב", "לשלם חשבון חשמל", "לתקן את ה־CI"]);
  assert.equal(await expand(pool), 0, "בפעם השנייה — אין מה למלא");
  await db.query("INSERT INTO tasks (title) VALUES ('מהקוד הישן')");
  assert.equal(await expand(pool), 1, "שורה של הקוד הישן — ממולאת בהרצה הבאה");
  assert.equal(pool.totalCount - pool.idleCount, 0);
});
test("contract — רק אחרי שהכול הועבר", async (t) => {
  const { expand, contract } = await get();
  const db = await sandbox(t, import.meta.url, "rename.sql");
  const pool = db.pool(2);
  await expand(pool);
  await db.query("INSERT INTO tasks (title) VALUES ('עוד לא הועבר')");
  await assert.rejects(contract(pool), { message: "NOT_MIGRATED" });
  assert.deepEqual(await columns(db), ["id:NO", "title:NO", "done:NO", "name:YES"], "לא נגע בכלום");
  await expand(pool);
  await contract(pool);
  assert.deepEqual(await columns(db), ["id:NO", "done:NO", "name:NO"]);
  assert.equal(pool.totalCount - pool.idleCount, 0, "כל החיבורים חזרו");
});
test("contract לפני expand ← שגיאה, בלי שינוי", async (t) => {
  const { contract } = await get();
  const db = await sandbox(t, import.meta.url, "rename.sql");
  await assert.rejects(contract(db.pool(2)));
  assert.deepEqual(await columns(db), ["id:NO", "title:NO", "done:NO"]);
});
