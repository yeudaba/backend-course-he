import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P18-E82.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["renameOwner"])).renameOwner;
const owners = async (db) => (await db.rows("SELECT id, owner FROM accounts ORDER BY id")).map((r) => `${r.id}:${r.owner}`);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("עדכון — ו־true / false לפי rowCount", async (t) => {
  const renameOwner = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  assert.equal(await renameOwner(pool, 2, "Yossi Cohen"), true, 'renameOwner(pool, 2, "Yossi Cohen") — החשבון קיים');
  assert.equal(await renameOwner(pool, 3, "  Noa M  "), true, 'renameOwner(pool, 3, "  Noa M  ")');
  assert.deepEqual(await owners(db), ["1:Dana", "2:Yossi Cohen", "3:Noa M", "4:Avi"], "השמות בטבלה (השם נשמר אחרי trim)");
  assert.equal(await renameOwner(pool, 99, "Ghost"), false, 'renameOwner(pool, 99, "Ghost") — אין חשבון 99, ציפינו ל־false');
  assert.equal(await renameOwner(pool, 1, "O'Brien"), true, `renameOwner(pool, 1, "O'Brien") — גרש בשם (פרמטרים, לא שרשור)`);
  assert.equal((await db.rows("SELECT owner FROM accounts WHERE id = 1"))[0].owner, "O'Brien");
});
test("שם ריק — שגיאה בלי לפנות למסד", async (t) => {
  const renameOwner = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  let queries = 0;
  const real = db.pool(1);
  const pool = { query: (...a) => (queries++, real.query(...a)), connect: (...a) => (queries++, real.connect(...a)) };
  for (const owner of ["", "   "]) {
    await assert.rejects(renameOwner(pool, 1, owner), { message: "שם ריק" }, `renameOwner(pool, 1, ${JSON.stringify(owner)})`);
  }
  assert.equal(queries, 0, "שם ריק — לא שולחים שאילתה למסד");
  assert.deepEqual(await owners(db), ["1:Dana", "2:Yossi", "3:Noa", "4:Avi"], "שום שם לא השתנה");
});
