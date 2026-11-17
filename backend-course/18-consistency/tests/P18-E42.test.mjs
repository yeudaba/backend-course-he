import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P18-E42.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["importTransfers"])).importTransfers;
const balances = async (db) => (await db.rows("SELECT balance FROM accounts ORDER BY id")).map((r) => r.balance);
const noDb = { connect: () => { throw new Error("פנית למסד לפני שכל הקובץ נבדק"); }, query: () => { throw new Error("פנית למסד"); } };

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("ייבוא תקין", async (t) => {
  const importTransfers = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  assert.equal(await importTransfers(pool, "from,to,amount\r\n4,3,100\r\n\r\n1, 2 ,0.5\n4,1,9.99\n\n"), 3);
  assert.deepEqual(await balances(db), [1009.49, 250.5, 100, 4890.01]);
  assert.equal(await importTransfers(pool, "from,to,amount\n"), 0, "רק כותרת — 0");
});
test("שורה לא תקינה — שגיאה עם מספר השורה, בלי מסד", async () => {
  const importTransfers = await get();
  const cases = [
    ["from,to,amount\n1,2,10\n1,2\n", 3],
    ["from,to,amount\n1,2,10\n\n1,x,10\n", 4],
    ["from,to,amount\n1,2,-1\n", 2],
    ["from,to,amount\n0,2,1\n", 2],
    ["from,to,amount\n1.5,2,1\n", 2],
    ["from,to,amount\n1,2,1,9\n", 2],
    ["from,to,amount\n1,,1\n", 2],
  ];
  for (const [csv, n] of cases) await assert.rejects(importTransfers(noDb, csv), { message: `שורה ${n}: לא תקינה` }, JSON.stringify(csv));
});
test("שגיאה מהמסד — ROLLBACK לכולן, עם מספר השורה", async (t) => {
  const importTransfers = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  await assert.rejects(importTransfers(pool, "from,to,amount\n4,3,100\n2,3,200\n2,1,100\n"), (e) => /^שורה 4: .*check constraint/.test(e.message), "שורה 4 — ל־Yossi נשארו 50");
  await assert.rejects(importTransfers(pool, "from,to,amount\n4,3,100\n\n4,77,1\n"), (e) => /^שורה 4: .*foreign key/.test(e.message));
  assert.deepEqual(await balances(db), [1000, 250, 0, 5000], "שום יתרה לא השתנתה");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 0);
});
