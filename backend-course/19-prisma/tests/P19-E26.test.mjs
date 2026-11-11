import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { schemaToSql } from "./_schema.mjs";

const FILE = "P19-E26.prisma";
const rejects = async (db, sql, msg) => assert.rejects(db.query(sql), undefined, `${msg} — המסד היה צריך לסרב`);
const accepts = async (db, sql, msg) => {
  try {
    await db.query(sql);
  } catch (err) {
    assert.fail(`${msg} — המסד סירב: ${err.message}`);
  }
};

let cached;
function schema() {
  cached ??= schemaToSql(import.meta.url, FILE);
  return cached;
}

async function library(t) {
  const s = schema();
  assert.ok(s.ok, s.output);
  const db = await sandbox(t, import.meta.url);
  await db.query(s.sql);
  return db;
}

async function columns(db, table) {
  const rows = await db.rows("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 ORDER BY column_name", [table]);
  return Object.fromEntries(rows.map((r) => [r.column_name, r.is_nullable === "YES"]));
}

test("ה־schema תקין, ו־prisma מייצר ממנו טבלאות", () => {
  const s = schema();
  assert.ok(s.ok, s.output);
});
test("שמות הטבלאות והעמודות ב־snake_case (‏@@map ו־@map)", async (t) => {
  const db = await library(t);
  assert.deepEqual(await columns(db, "authors"), { full_name: false, id: false }, "authors: id, full_name (חובה)");
  assert.deepEqual(await columns(db, "books"), { id: false, isbn: false, published_year: true, title: false }, "books: published_year לא חובה (Int?)");
  assert.deepEqual(await columns(db, "book_authors"), { author_id: false, book_id: false });
  assert.deepEqual(await columns(db, "members"), { email: false, full_name: false, id: false });
  assert.deepEqual(await columns(db, "loans"), { book_id: false, id: false, loaned_on: false, member_id: false, returned_on: true }, "loans: returned_on לא חובה (DateTime?)");
  const [type] = await db.rows("SELECT data_type FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'loans' AND column_name = 'loaned_on'");
  assert.equal(type.data_type, "date", "loaned_on הוא תאריך בלבד (@db.Date)");
});
test("ייחודיות, מפתחות ו־default", async (t) => {
  const db = await library(t);
  await db.query("INSERT INTO authors (full_name) VALUES ('Noa Bar'), ('Rina Tal')");
  await db.query("INSERT INTO books (title, isbn) VALUES ('Coffee at Dawn', '978-1-11'), ('Small Servers', '978-1-33')");
  await db.query("INSERT INTO members (full_name, email) VALUES ('Dana Levi', 'dana@example.com')");
  await rejects(db, "INSERT INTO books (title, isbn) VALUES ('X', '978-1-11')", "isbn כפול (@unique)");
  await rejects(db, "INSERT INTO members (full_name, email) VALUES ('X', 'dana@example.com')", "email כפול (@unique)");
  await accepts(db, "INSERT INTO book_authors (book_id, author_id) VALUES (1, 1), (2, 2), (2, 1)", "קישורי ספר־מחבר");
  await rejects(db, "INSERT INTO book_authors (book_id, author_id) VALUES (1, 1)", "אותו זוג פעמיים (@@id([bookId, authorId]))");
  await rejects(db, "INSERT INTO book_authors (book_id, author_id) VALUES (9, 1)", "ספר שלא קיים (@relation)");
  await rejects(db, "INSERT INTO loans (book_id, member_id) VALUES (1, 9)", "חבר שלא קיים (@relation)");
  await accepts(db, "INSERT INTO loans (book_id, member_id) VALUES (2, 1)", "השאלה בלי תאריך — ברירת מחדל");
  const [l] = await db.rows("SELECT loaned_on = CURRENT_DATE AS today FROM loans");
  assert.equal(l.today, true, "loaned_on — ברירת מחדל היום (@default(now()))");
});
test("מחיקות: CASCADE רק בקישור ספר־מחבר", async (t) => {
  const db = await library(t);
  await db.query("INSERT INTO authors (full_name) VALUES ('Noa Bar'), ('Rina Tal')");
  await db.query("INSERT INTO books (title, isbn) VALUES ('Coffee at Dawn', '978-1-11'), ('Draft', '978-9-99')");
  await db.query("INSERT INTO members (full_name, email) VALUES ('Dana Levi', 'dana@example.com')");
  await db.query("INSERT INTO book_authors (book_id, author_id) VALUES (1, 1), (2, 2)");
  await db.query("INSERT INTO loans (book_id, member_id) VALUES (1, 1)");
  await rejects(db, "DELETE FROM authors WHERE id = 1", "מחיקת מחבר שיש לו ספרים");
  await rejects(db, "DELETE FROM books WHERE id = 1", "מחיקת ספר שיש לו השאלות (בלי onDelete ב־Loan)");
  await rejects(db, "DELETE FROM members WHERE id = 1", "מחיקת חבר שיש לו השאלות");
  await accepts(db, "DELETE FROM books WHERE id = 2", "מחיקת ספר בלי השאלות");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM book_authors"))[0].n, 1, "מחיקת ספר מוחקת את הקישורים שלו (onDelete: Cascade ב־BookAuthor.book)");
});
