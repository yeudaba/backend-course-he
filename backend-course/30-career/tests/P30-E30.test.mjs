import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { listTasks } = await load(import.meta.url, "P30-E30.ts");
function fakeDb() {
  const calls = [];
  return { calls, query: async (text, params) => { calls.push({ text, params }); return { rows: [{ id: 1 }] }; } };
}

test("רק המשימות של המשתמש: user_id כפרמטר ראשון", async () => {
  const db = fakeDb();
  assert.deepEqual(await listTasks(db, 42), [{ id: 1 }]);
  assert.equal(db.calls.length, 1);
  assert.match(db.calls[0].text, /\bWHERE user_id = \$1\b/);
  assert.deepEqual(db.calls[0].params, [42]);
});
test("status — כפרמטר, לא בתוך הטקסט", async () => {
  const db = fakeDb();
  const evil = "x' OR '1'='1";
  await listTasks(db, 42, { status: evil });
  const { text, params } = db.calls[0];
  assert.ok(!text.includes(evil) && !text.includes("OR '1'"), `ערך מהמשתמש נכנס ל־SQL: ${text}`);
  assert.deepEqual(params, [42, evil]);
  assert.match(text, /status = \$2/);
});
test("מיון: רק מרשימה סגורה; אחרת RangeError ובלי שאילתה", async () => {
  const db = fakeDb();
  await listTasks(db, 1, { sort: "due", order: "desc" });
  assert.match(db.calls[0].text, /ORDER BY due_date DESC/);
  for (const bad of [{ sort: "id; DROP TABLE tasks" }, { sort: "password_hash" }, { order: "desc; DELETE FROM tasks" }]) {
    await assert.rejects(listTasks(db, 1, bad), RangeError, JSON.stringify(bad));
  }
  assert.equal(db.calls.length, 1, "שאילתה לא נשלחת כשהקלט לא תקין");
});
test("ברירת מחדל: created_at ASC", async () => {
  const db = fakeDb();
  await listTasks(db, 1);
  assert.match(db.calls[0].text, /ORDER BY created_at ASC/);
});
