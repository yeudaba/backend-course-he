import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P21-E79.ts", ["listNotes", "findNote", "updateNote", "deleteNote"]);
async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE notes (id serial PRIMARY KEY, owner_id int NOT NULL, title text NOT NULL, body text NOT NULL DEFAULT '');
    INSERT INTO notes (owner_id, title, body) VALUES (1, 'של דנה', 'סוד'), (2, 'של יוסי', 'רשימת קניות'), (1, 'עוד של דנה', '');`);
  return db;
}
const all = (db) => db.rows("SELECT id, owner_id, title, body FROM notes ORDER BY id");

test("list ו־find", async (t) => {
  const { listNotes, findNote } = await get();
  const db = await setup(t);
  assert.deepEqual(await listNotes(db.client, 1), [{ id: 1, title: "של דנה", body: "סוד" }, { id: 3, title: "עוד של דנה", body: "" }], "רק של הבעלים, בלי owner_id");
  assert.deepEqual(await listNotes(db.client, 9), []);
  assert.deepEqual(await findNote(db.client, 2, 2), { id: 2, title: "של יוסי", body: "רשימת קניות" });
  assert.equal(await findNote(db.client, 2, 1), undefined, "פתק של דנה, ביקש יוסי ← undefined");
  assert.equal(await findNote(db.client, 1, 99), undefined);
});
test("update", async (t) => {
  const { updateNote } = await get();
  const db = await setup(t);
  const before = await all(db);
  assert.equal(await updateNote(db.client, 2, 1, { title: "נפרץ" }), undefined, "יוסי מעדכן פתק של דנה");
  assert.deepEqual(await all(db), before, "ושום דבר לא השתנה");
  assert.deepEqual(await updateNote(db.client, 1, 1, { body: "חדש" }), { id: 1, title: "של דנה", body: "חדש" }, "רק body — title נשאר");
  assert.deepEqual(await updateNote(db.client, 1, 1, { title: "כותרת" }), { id: 1, title: "כותרת", body: "חדש" });
  assert.deepEqual(await updateNote(db.client, 1, 3, { title: "א", body: "ב" }), { id: 3, title: "א", body: "ב" });
  assert.deepEqual(await updateNote(db.client, 1, 3, { body: "" }), { id: 3, title: "א", body: "" }, "מחרוזת ריקה היא ערך — לא 'לא הגיע'");
});
test("delete", async (t) => {
  const { deleteNote } = await get();
  const db = await setup(t);
  assert.equal(await deleteNote(db.client, 2, 1), false, "יוסי מוחק פתק של דנה");
  assert.equal((await all(db)).length, 3);
  assert.equal(await deleteNote(db.client, 1, 1), true);
  assert.equal(await deleteNote(db.client, 1, 1), false);
  assert.deepEqual((await all(db)).map((r) => r.id), [2, 3]);
});
