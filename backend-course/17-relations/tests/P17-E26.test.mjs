import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const rejects = async (db, sql, msg) => assert.rejects(db.query(sql), undefined, `${msg} — המסד היה צריך לסרב`);
const accepts = async (db, sql, msg) => {
  try {
    await db.query(sql);
  } catch (err) {
    assert.fail(`${msg} — המסד סירב: ${err.message}`);
  }
};
const count = async (db, table) => (await db.rows(`SELECT COUNT(*) AS n FROM ${table}`))[0].n;

test("P17-E26: ההשאלות הפתוחות (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url);
  const got = await db.fileRows("P17-E26.sql");
  const expected = await db.expectedRows("P17-E26.sql");
  assert.deepEqual(Object.keys(got?.[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן (title, member, loaned_on)");
  assert.deepEqual(got, expected);
});
test("P17-E26: הנתונים", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P17-E26.sql");
  const links = await db.rows("SELECT b.title, a.full_name FROM book_authors ba JOIN books b ON b.id = ba.book_id JOIN authors a ON a.id = ba.author_id ORDER BY b.id, a.id");
  assert.deepEqual(links.map((r) => `${r.title} / ${r.full_name}`), ["Coffee at Dawn / Noa Bar", "The Long Queue / Eli Sason", "The Long Queue / Rina Tal", "Small Servers / Rina Tal"]);
  const books = await db.rows("SELECT title, isbn, published_year FROM books ORDER BY id");
  assert.deepEqual(books, [
    { title: "Coffee at Dawn", isbn: "978-1-11", published_year: 2019 },
    { title: "The Long Queue", isbn: "978-1-22", published_year: 2021 },
    { title: "Small Servers", isbn: "978-1-33", published_year: null },
  ]);
  assert.equal(await count(db, "loans"), 3);
  assert.equal(await count(db, "members"), 2);
});
test("P17-E26: מפתחות ואילוצים", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P17-E26.sql");
  await rejects(db, "INSERT INTO books (title, isbn) VALUES ('X', '978-1-11')", "isbn כפול");
  await rejects(db, "INSERT INTO books (title) VALUES ('X')", "isbn חובה");
  await rejects(db, "INSERT INTO members (full_name, email) VALUES ('X', 'dana@example.com')", "email כפול");
  await rejects(db, "INSERT INTO book_authors (book_id, author_id) VALUES (2, 3)", "אותו זוג ספר־מחבר פעמיים (PRIMARY KEY (book_id, author_id))");
  await rejects(db, "INSERT INTO book_authors (book_id, author_id) VALUES (99, 1)", "ספר שלא קיים (FK)");
  await rejects(db, "INSERT INTO loans (book_id, member_id) VALUES (1, 99)", "חבר שלא קיים (FK)");
  await rejects(db, "INSERT INTO loans (book_id, member_id, loaned_on, returned_on) VALUES (1, 2, '2026-11-05', '2026-11-04')", "החזרה לפני ההשאלה");
  await accepts(db, "INSERT INTO loans (book_id, member_id) VALUES (1, 2)", "השאלה בלי תאריך (ברירת מחדל: היום) ובלי החזרה");
  const [l] = await db.rows("SELECT loaned_on = CURRENT_DATE AS today FROM loans WHERE id = (SELECT MAX(id) FROM loans)");
  assert.equal(l.today, true, "loaned_on — ברירת מחדל היום");
});
test("P17-E26: מה קורה במחיקה", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P17-E26.sql");
  await rejects(db, "DELETE FROM authors WHERE full_name = 'Rina Tal'", "מחיקת מחבר שיש לו ספרים");
  await rejects(db, "DELETE FROM members WHERE email = 'dana@example.com'", "מחיקת חבר שיש לו השאלות");
  await rejects(db, "DELETE FROM books WHERE isbn = '978-1-22'", "מחיקת ספר שיש לו השאלות");
  await db.query("INSERT INTO books (title, isbn) VALUES ('Draft', '978-9-99')");
  await db.query("INSERT INTO book_authors (book_id, author_id) SELECT id, 1 FROM books WHERE isbn = '978-9-99'");
  await accepts(db, "DELETE FROM books WHERE isbn = '978-9-99'", "מחיקת ספר בלי השאלות");
  assert.equal(await count(db, "book_authors"), 4, "מחיקת ספר מוחקת את הקישורים שלו (ON DELETE CASCADE)");
});
