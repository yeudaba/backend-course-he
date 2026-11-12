import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { code } from "./_ts.mjs";

const state = async (db) => ({
  balances: Object.fromEntries((await db.rows("SELECT id, balance FROM accounts")).map((r) => [r.id, r.balance])),
  transfers: await db.rows("SELECT from_id, to_id, amount FROM transfers ORDER BY id"),
});

for (const [label, yossi, setup] of [["הנתונים של bank.sql", 250, ""], ["אחרי שהיתרה של Yossi השתנתה ל־777.50", 777.5, "UPDATE accounts SET balance = 777.50 WHERE id = 2"]]) {
  test(`P18-E34: ${label}`, async (t) => {
    const db = await sandbox(t, import.meta.url, "bank.sql");
    if (setup) await db.query(setup);
    await db.runFile("P18-E34.sql");
    const s = await state(db);
    assert.equal(s.balances[2], 0, "היתרה של Yossi אופסה");
    assert.equal(s.balances[1], 1000 + yossi, `Dana קיבלה את כל היתרה של Yossi (${yossi})`);
    assert.deepEqual([s.balances[3], s.balances[4]], [0, 5000], "שאר החשבונות לא השתנו");
    assert.deepEqual(s.transfers, [{ from_id: 2, to_id: 1, amount: yossi }], "העברה אחת רשומה, בסכום היתרה");
  });
}
test("P18-E34: בתוך transaction", () => {
  const src = code(import.meta.url, "P18-E34.sql").replace(/--.*$/gm, "");
  assert.match(src, /\bBEGIN\b/i, "חסר BEGIN");
  assert.match(src, /\bCOMMIT\b/i, "חסר COMMIT");
  assert.doesNotMatch(src, /\b250\b/, "בלי לכתוב את 250 ביד — תת־שאילתה");
});
