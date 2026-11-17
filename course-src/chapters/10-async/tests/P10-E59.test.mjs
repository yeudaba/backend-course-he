import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";
import { calls, tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E59.js", ["loadUsers"]);
const t = tmpFiles({
  "ok.csv": "name,age,city\nדנה, 31 ,חיפה\nעומר,27,תל אביב\n",
  "blank.csv": "name,age,city\n\n  נועה ,40, אילת\n\n",
  "header.csv": "name,age,city\n",
  "bad-age.csv": "name,age,city\nדנה,31,חיפה\nעומר,זקן,תל אביב\nרון,5,עכו\n",
  "bad-cols.csv": "name,age,city\nדנה,31,חיפה,עוד\n",
  "empty-age.csv": "name,age,city\nדנה,31,חיפה\nגיל,,לוד\nמאיה,22\n",
});
const load = async (name) => {
  const { loadUsers } = await get();
  return calls((cb) => loadUsers(t.p(name), cb));
};

test("הדוגמה מהמשימה", async () => {
  const c = await load("ok.csv");
  assert.equal(c.length, 1);
  assert.deepEqual(c[0].args, [null, [{ name: "דנה", age: 31, city: "חיפה" }, { name: "עומר", age: 27, city: "תל אביב" }]]);
});
test("שורות ריקות ורווחים; רק כותרת ← []", async () => {
  assert.deepEqual((await load("blank.csv"))[0].args, [null, [{ name: "נועה", age: 40, city: "אילת" }]]);
  assert.deepEqual((await load("header.csv"))[0].args, [null, []]);
});
test("שורה לא תקינה ← Error עם מספר השורה בקובץ, פעם אחת", async () => {
  for (const [file, msg] of [["bad-age.csv", "שורה 3 לא תקינה"], ["bad-cols.csv", "שורה 2 לא תקינה"], ["empty-age.csv", "שורה 3 לא תקינה"]]) {
    const c = await load(file);
    assert.equal(c.length, 1, `${file}: ה־callback נקרא ${c.length} פעמים — return אחרי השגיאה, לא break`);
    assert.ok(c[0].args[0] instanceof Error, `${file}: צריך Error בארגומנט הראשון`);
    assert.equal(c[0].args[0].message, msg, file);
  }
});
test("קובץ שלא קיים ← השגיאה המקורית", async () => {
  const c = await load("nope.csv");
  assert.equal(c.length, 1);
  assert.equal(c[0].args[0]?.code, "ENOENT");
});
