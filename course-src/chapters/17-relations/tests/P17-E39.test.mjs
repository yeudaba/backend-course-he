import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { sameAsSolution } from "./_compare.mjs";

const count = async (db, sql) => (await db.rows(sql))[0].n;

test("P17-E39: הפניות (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E39.sql");
});
test("P17-E39: ההודעות, ו־NOT NULL / ברירות מחדל", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E39.sql");
  const msgs = await db.rows("SELECT ticket_id, body FROM ticket_messages ORDER BY id");
  assert.deepEqual(msgs, [
    { ticket_id: 1, body: "Hi, I was promised 10%" },
    { ticket_id: 1, body: "Any news?" },
    { ticket_id: 2, body: "Please fix my email" },
  ]);
  const [guest] = await db.rows("INSERT INTO support_tickets (subject) VALUES ('Guest question') RETURNING customer_id, opened_at");
  assert.equal(guest.customer_id, null, "פנייה של אורח (בלי לקוח) — מותרת");
  assert.ok(guest.opened_at instanceof Date, "opened_at — ברירת מחדל now()");
  await assert.rejects(db.query("INSERT INTO support_tickets (customer_id) VALUES (1)"), undefined, "subject חובה");
  await assert.rejects(db.query("INSERT INTO support_tickets (customer_id, subject) VALUES (99, 'x')"), undefined, "לקוח שלא קיים — FK");
  await assert.rejects(db.query("INSERT INTO ticket_messages (ticket_id, body) VALUES (99, 'x')"), undefined, "הודעה לפנייה שלא קיימת — FK");
  await assert.rejects(db.query("INSERT INTO ticket_messages (body) VALUES ('x')"), undefined, "ticket_id חובה");
  await assert.rejects(db.query("INSERT INTO ticket_messages (ticket_id) VALUES (1)"), undefined, "body חובה");
  const [m] = await db.rows("INSERT INTO ticket_messages (ticket_id, body) VALUES (1, 'x') RETURNING sent_at");
  assert.ok(m.sent_at instanceof Date, "sent_at — ברירת מחדל now()");
});
test("P17-E39: מחיקות — SET NULL ו־CASCADE", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E39.sql");
  try {
    await db.query("DELETE FROM customers WHERE id = 8");
  } catch (err) {
    assert.fail(`מחיקת לקוח עם פנייה נכשלה (${err.message}) — הפנייה צריכה להישאר עם customer_id ריק (ON DELETE SET NULL, בלי NOT NULL)`);
  }
  const t1 = await db.rows("SELECT customer_id, subject FROM support_tickets WHERE id = 1");
  assert.deepEqual(t1, [{ customer_id: null, subject: "Where is my discount?" }], "הפנייה של עומר נשארה, בלי לקוח");
  assert.equal(await count(db, "SELECT COUNT(*) AS n FROM ticket_messages WHERE ticket_id = 1"), 2, "ההודעות של הפנייה נשארו");
  await db.query("DELETE FROM support_tickets WHERE id = 2");
  assert.equal(await count(db, "SELECT COUNT(*) AS n FROM ticket_messages WHERE ticket_id = 2"), 0, "מחיקת פנייה מוחקת את ההודעות שלה (ON DELETE CASCADE)");
});
