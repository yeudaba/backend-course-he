import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const rejects = async (db, sql, msg) => assert.rejects(db.query(sql), undefined, msg);

test("התוצאה של הקובץ", async (t) => {
  const db = await sandbox(t, import.meta.url);
  const rows = await db.fileRows("P16-E76.sql");
  assert.deepEqual(rows, [
    { email: "dana@example.com", source: "site", confirmed: false },
    { email: "yossi@example.com", source: "checkout", confirmed: true },
    { email: "noa@example.com", source: "import", confirmed: false },
  ]);
  const all = await db.rows("SELECT id, subscribed_on::text AS d, subscribed_on = CURRENT_DATE AS today FROM subscribers ORDER BY id");
  assert.deepEqual(all.map((r) => r.id), [1, 2, 3]);
  assert.deepEqual(all.map((r) => r.today), [true, true, false], "ברירת מחדל: היום; noa — 2026-01-08");
  assert.equal(all[2].d, "2026-01-08");
});
test("אילוצים וברירות מחדל", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P16-E76.sql");
  const [r] = await db.rows("INSERT INTO subscribers (email) VALUES ('new@x.com') RETURNING source, confirmed");
  assert.deepEqual(r, { source: "site", confirmed: false });
  await rejects(db, "INSERT INTO subscribers (email) VALUES ('dana@example.com')", "email ייחודי");
  await rejects(db, "INSERT INTO subscribers (email, source) VALUES ('a@x.com', 'facebook')", "source מהרשימה בלבד");
  await rejects(db, "INSERT INTO subscribers (email, source) VALUES ('b@x.com', NULL)", "source חובה");
  await rejects(db, "INSERT INTO subscribers (email, confirmed) VALUES ('c@x.com', NULL)", "confirmed חובה");
  await rejects(db, "INSERT INTO subscribers (email, subscribed_on) VALUES ('d@x.com', NULL)", "subscribed_on חובה");
  await rejects(db, "INSERT INTO subscribers (source) VALUES ('site')", "email חובה");
  await rejects(db, "INSERT INTO subscribers (id, email) VALUES (99, 'e@x.com')", "id — רק המסד ממספר");
});
