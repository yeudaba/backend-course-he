import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { countingPool } from "./_helpers.mjs";

const FILE = "P18-E78.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["insertTransfers"])).insertTransfers;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("2,500 שורות — 3 פקודות INSERT, ids לפי הסדר", async (t) => {
  const insertTransfers = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const real = db.pool(2);
  const sent = [];
  const pool = {
    connect: async () => {
      const c = await real.connect();
      const q = c.query.bind(c);
      c.query = (text, values) => (sent.push({ text, values }), q(text, values));
      return c;
    },
    query: (text, values) => (sent.push({ text, values }), real.query(text, values)),
  };
  const rows = Array.from({ length: 2500 }, (_, i) => ({ from: 4, to: 1 + (i % 3), amount: (i % 50) + 0.5 }));
  const ids = await insertTransfers(pool, rows);
  assert.deepEqual(ids, Array.from({ length: 2500 }, (_, i) => i + 1));
  const inserts = sent.filter((s) => /INSERT/i.test(s.text));
  assert.equal(inserts.length, 3, "2,500 שורות ← 3 פקודות INSERT (עד 1,000 בכל אחת)");
  for (const s of inserts) {
    assert.ok(s.values && s.values.length > 0, "ערכים כפרמטרים");
    assert.doesNotMatch(s.text, /\(\s*4\s*,/, "הערכים לא בתוך טקסט השאילתה");
  }
  const check = await db.rows("SELECT id, from_id, to_id, amount FROM transfers WHERE id IN (1, 1001, 2500) ORDER BY id");
  assert.deepEqual(check, [
    { id: 1, from_id: 4, to_id: 1, amount: 0.5 },
    { id: 1001, from_id: 4, to_id: 2, amount: 0.5 },
    { id: 2500, from_id: 4, to_id: 1, amount: 49.5 },
  ]);
});
test("שורה לא חוקית — אף אחת לא נכנסת; ריק — בלי מסד", async (t) => {
  const insertTransfers = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const { pool, counter } = countingPool(db.pool(2));
  const rows = Array.from({ length: 1500 }, (_, i) => ({ from: 1, to: 2, amount: 1 }));
  rows[1200] = { from: 1, to: 1, amount: 1 };
  await assert.rejects(insertTransfers(pool, rows), (e) => e.code === "23514", "from = to — CHECK בקבוצה השנייה");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 0, "גם הקבוצה הראשונה בוטלה (transaction אחד)");
  counter.n = 0;
  assert.deepEqual(await insertTransfers(pool, []), []);
  assert.equal(counter.n, 0);
  const one = await insertTransfers(pool, [{ from: 1, to: 3, amount: 7 }]);
  assert.equal(one.length, 1);
  assert.deepEqual(await db.rows("SELECT from_id, to_id, amount FROM transfers WHERE id = $1", [one[0]]), [{ from_id: 1, to_id: 3, amount: 7 }]);
});
