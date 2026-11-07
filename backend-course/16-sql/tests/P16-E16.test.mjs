import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const rejects = async (db, sql, msg) => assert.rejects(db.query(sql), undefined, msg);

test("טבלת reviews ואילוצים", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P16-E16.sql");
  const [r] = await db.rows("INSERT INTO reviews (product_id, rating, author_email) VALUES (1, 5, 'a@x.com') RETURNING *");
  assert.equal(r.id, 1);
  assert.equal(r.comment, null);
  assert.ok(r.created_at instanceof Date && Math.abs(r.created_at - Date.now()) < 60_000, "created_at — ברירת מחדל עכשיו");
  await db.query("INSERT INTO reviews (product_id, rating, comment, author_email) VALUES (2, 1, repeat('x', 500), 'a@x.com'), (1, 3, NULL, 'b@x.com')");
  await rejects(db, "INSERT INTO reviews (product_id, rating, author_email) VALUES (1, 4, 'a@x.com')", "אותו מחבר + אותו מוצר");
  await rejects(db, "INSERT INTO reviews (product_id, rating, author_email) VALUES (3, 0, 'c@x.com')", "rating 0");
  await rejects(db, "INSERT INTO reviews (product_id, rating, author_email) VALUES (3, 6, 'c@x.com')", "rating 6");
  await rejects(db, "INSERT INTO reviews (product_id, rating, comment, author_email) VALUES (3, 4, repeat('x', 501), 'c@x.com')", "comment של 501 תווים");
  await rejects(db, "INSERT INTO reviews (rating, author_email) VALUES (4, 'c@x.com')", "product_id חובה");
  await rejects(db, "INSERT INTO reviews (product_id, author_email) VALUES (3, 'c@x.com')", "rating חובה");
  await rejects(db, "INSERT INTO reviews (product_id, rating) VALUES (3, 4)", "author_email חובה");
  await rejects(db, "INSERT INTO reviews (id, product_id, rating, author_email) VALUES (99, 3, 4, 'd@x.com')", "id — רק המסד ממספר (GENERATED ALWAYS)");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM reviews"))[0].n, 3);
});
