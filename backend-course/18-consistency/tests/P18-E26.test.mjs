import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";
import { withTimeout } from "./_helpers.mjs";

const FILE = "P18-E26.ts";
const get = () => exportsOf(import.meta.url, FILE, ["withTransaction", "transferAll"]);
const balances = async (db) => (await db.rows("SELECT balance FROM accounts ORDER BY id")).map((r) => r.balance);

test("עובר בדיקת טיפוסים, ו־withTransaction מעבירה את הטיפוס של התוצאה", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { withTransaction, transferAll } from "FILE";
declare const pool: Parameters<typeof transferAll>[0];
const n: Promise<number> = withTransaction(pool, async () => 5);
const s: Promise<string> = withTransaction(pool, async (client) => { await client.query("SELECT 1"); return "ok"; });
const t: Promise<number> = transferAll(pool, 1, 2);
// @ts-expect-error — withTransaction(pool, async () => 5) מחזירה Promise<number>, לא Promise<string>
const bad: Promise<string> = withTransaction(pool, async () => 5);
`);
  assert.ok(p.ok, p.message);
});
test("withTransaction — COMMIT ומחזירה את התוצאה", async (t) => {
  const { withTransaction } = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  const result = await withTransaction(pool, async (client) => {
    await client.query("UPDATE accounts SET balance = 1 WHERE id = 3");
    return "done";
  });
  assert.equal(result, "done", "withTransaction צריכה להחזיר את מה ש־fn החזירה");
  assert.deepEqual(await balances(db), [1000, 250, 1, 5000], "השינוי לא נשמר — חסר COMMIT?");
  assert.equal(pool.idleCount, pool.totalCount, "החיבור לא שוחרר (release ב־finally)");
});
test("withTransaction — שגיאה: ROLLBACK, אותה שגיאה, והחיבור משתחרר", async (t) => {
  const { withTransaction } = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  const boom = new Error("boom");
  for (let i = 0; i < 5; i++) {
    await assert.rejects(
      withTimeout(withTransaction(pool, async (client) => {
        await client.query("UPDATE accounts SET balance = 0 WHERE id = 1");
        throw boom;
      }), 3000, "נתקע — חיבורים לא משתחררים אחרי שגיאה"),
      (e) => e === boom,
      "צריך לזרוק הלאה את אותה שגיאה בדיוק",
    );
  }
  assert.deepEqual(await balances(db), [1000, 250, 0, 5000], "אחרי שגיאה השינוי היה צריך להתבטל (ROLLBACK)");
  assert.equal(pool.idleCount, pool.totalCount, "החיבורים לא שוחררו");
});
test("transferAll — מעבירה הכול ורושמת", async (t) => {
  const { transferAll } = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  const amount = await transferAll(pool, 2, 3);
  assert.equal(amount, 250);
  assert.equal(typeof amount, "number", "הסכום צריך להיות number (pg מחזיר numeric כמחרוזת — Number(...))");
  assert.deepEqual(await balances(db), [1000, 0, 250, 5000]);
  assert.deepEqual(await db.rows("SELECT from_id, to_id, amount FROM transfers"), [{ from_id: 2, to_id: 3, amount: 250 }]);
});
test("transferAll — שגיאות, וכלום לא משתנה", async (t) => {
  const { transferAll } = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  await assert.rejects(transferAll(pool, 3, 1), { message: "אין מה להעביר" });
  await assert.rejects(transferAll(pool, 99, 1), { message: "חשבון לא קיים: 99" });
  await assert.rejects(transferAll(pool, 1, 77), { message: "חשבון לא קיים: 77" });
  assert.deepEqual(await balances(db), [1000, 250, 0, 5000], "יעד לא קיים — הכסף היה צריך לחזור למקור (ROLLBACK)");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 0);
  assert.equal(pool.idleCount, pool.totalCount, "החיבורים לא שוחררו");
});
test("transferAll כתובה עם withTransaction", () => {
  const src = code(import.meta.url, FILE);
  assert.ok((src.match(/withTransaction\s*(<[^>]*>)?\s*\(/g) ?? []).length >= 2, "transferAll צריכה לקרוא ל־withTransaction (ולא לכתוב שוב BEGIN/COMMIT)");
  assert.equal((src.match(/["'`]BEGIN["'`]/g) ?? []).length, 1, "BEGIN צריך להופיע פעם אחת — רק בתוך withTransaction");
  assert.match(src, /FOR\s+UPDATE/i, "נעל את חשבון המקור (SELECT ... FOR UPDATE)");
});
