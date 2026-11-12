import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { withTimeout } from "./_helpers.mjs";

const FILE = "P18-E36.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["payMany"])).payMany;
const balances = async (db) => (await db.rows("SELECT balance FROM accounts ORDER BY id")).map((r) => r.balance);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("כמה תשלומים — מזהים לפי הסדר", async (t) => {
  const payMany = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  assert.deepEqual(await payMany(pool, 4, [{ toId: 2, amount: 100 }, { toId: 3, amount: 50.25 }, { toId: 2, amount: 10 }]), [1, 2, 3]);
  assert.deepEqual(await balances(db), [1000, 360, 50.25, 4839.75]);
  assert.deepEqual(await db.rows("SELECT from_id, to_id, amount FROM transfers ORDER BY id"), [
    { from_id: 4, to_id: 2, amount: 100 }, { from_id: 4, to_id: 3, amount: 50.25 }, { from_id: 4, to_id: 2, amount: 10 },
  ]);
  assert.deepEqual(await payMany(pool, 4, []), []);
});
test("אחד נכשל — אף אחד לא יוצא", async (t) => {
  const payMany = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  await assert.rejects(payMany(pool, 4, [{ toId: 2, amount: 100 }, { toId: 99, amount: 50 }, { toId: 3, amount: 1 }]), { message: "חשבון לא קיים: 99" });
  await assert.rejects(payMany(pool, 2, [{ toId: 1, amount: 200 }, { toId: 3, amount: 100 }]), (e) => e.code === "23514", "ל־Yossi 250: התשלום השני נכשל ב־CHECK");
  assert.deepEqual(await balances(db), [1000, 250, 0, 5000], "שום יתרה לא השתנתה");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 0);
  await withTimeout((async () => {
    for (let i = 0; i < 8; i++) await payMany(pool, 3, [{ toId: 1, amount: 5 }]).catch(() => {});
    await payMany(pool, 1, [{ toId: 3, amount: 1 }]);
  })(), 6000, "נתקע — חיבור לא שוחרר אחרי שגיאה");
});
test("מערך ריק — בלי לפנות למסד", async () => {
  const payMany = await get();
  const pool = { connect: () => { throw new Error("פנית למסד עם מערך ריק"); }, query: () => { throw new Error("פנית למסד עם מערך ריק"); } };
  assert.deepEqual(await payMany(pool, 1, []), []);
});
