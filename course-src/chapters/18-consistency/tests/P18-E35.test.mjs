import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { withTimeout } from "./_helpers.mjs";

const FILE = "P18-E35.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["openAccount"])).openAccount;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("פתיחה מוצלחת", async (t) => {
  const openAccount = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  const id = await openAccount(pool, "Kid", 1, 120.5);
  assert.equal(id, 5, "החשבון החדש — id 5");
  const rows = await db.rows("SELECT id, owner, balance FROM accounts WHERE id IN (1, 5) ORDER BY id");
  assert.deepEqual(rows, [{ id: 1, owner: "Dana", balance: 879.5 }, { id: 5, owner: "Kid", balance: 120.5 }]);
  assert.deepEqual(await db.rows("SELECT from_id, to_id, amount FROM transfers"), [{ from_id: 1, to_id: 5, amount: 120.5 }]);
  assert.equal(await openAccount(pool, "Kid 2", 4, 1), 6);
});
test("כישלון — לא נשאר חשבון, לא דולפים חיבורים", async (t) => {
  const openAccount = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  await assert.rejects(openAccount(pool, "Ghost", 2, 300), (e) => e.code === "23514", "ל־Yossi אין 300 — השגיאה של ה־CHECK נזרקת כמו שהיא");
  await assert.rejects(openAccount(pool, "Ghost", 99, 10), undefined, "חשבון מקור שלא קיים — FK של transfers");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM accounts"))[0].n, 4, "לא נשאר חשבון 'רפאים'");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 0);
  assert.equal((await db.rows("SELECT balance FROM accounts WHERE id = 2"))[0].balance, 250);
  await withTimeout((async () => {
    for (let i = 0; i < 10; i++) await openAccount(pool, "x", 3, 1).catch(() => {});
    await openAccount(pool, "Last", 1, 1);
  })(), 6000, "נתקע — חיבור לא שוחרר אחרי שגיאה");
  assert.equal(pool.idleCount, pool.totalCount, "כל החיבורים חזרו ל־pool");
});
