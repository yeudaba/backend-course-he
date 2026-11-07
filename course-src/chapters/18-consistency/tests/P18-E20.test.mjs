import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";
import { withTimeout } from "./_helpers.mjs";

const { transfer } = await load(import.meta.url, "P18-E20.ts");
const balances = async (db) => Object.fromEntries((await db.rows("SELECT id, balance FROM accounts")).map((r) => [r.id, r.balance]));

test("העברה מצליחה", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  await transfer(pool, 1, 3, 150);
  const b = await balances(db);
  assert.deepEqual([b[1], b[3]], [850, 150]);
});
test("העברה שנכשלת לא משנה כלום", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  const before = await balances(db);
  
  await assert.rejects(transfer(pool, 2, 3, 500), (e) => e.code === "23514", "יתרה לא מספיקה ← שגיאת CHECK");
  assert.deepEqual(await balances(db), before, "שום יתרה לא השתנתה (גם לא של Noa)");

});
test("חיבורים לא דולפים", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  await withTimeout((async () => {
    for (let i = 0; i < 20; i++) await transfer(pool, 2, 3, 500).catch(() => {});
    await transfer(pool, 1, 3, 1);
  })(), 6000, "נתקע — כנראה חיבור לא שוחרר (release) אחרי שגיאה");
  assert.equal(pool.idleCount, pool.totalCount, "כל החיבורים חזרו ל־pool");
});
