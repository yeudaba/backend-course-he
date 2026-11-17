import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { exportsOf } from "./_src.mjs";
import { calls, tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E53.js", ["saveJson"]);
const t = tmpFiles({});

test("כותב JSON מעוצב, ו־callback(null)", async () => {
  const { saveJson } = await get();
  const data = { theme: "dark", sizes: [1, 2], nested: { a: true } };
  const c = await calls((cb) => saveJson(t.p("s.json"), data, cb));
  assert.equal(c.length, 1, `ה־callback נקרא ${c.length} פעמים`);
  assert.equal(c[0].args[0], null, "בהצלחה הארגומנט הראשון הוא null");
  assert.equal(fs.readFileSync(t.p("s.json"), "utf8"), JSON.stringify(data, null, 2));
});
test("BigInt ← השגיאה של stringify דרך ה־callback, לא מיד ולא זורקת", async () => {
  const { saveJson } = await get();
  let c;
  try {
    c = await calls((cb) => saveJson(t.p("b.json"), { n: 10n }, cb));
  } catch (err) {
    assert.fail(`saveJson זרקה (${err.message}) — העבר את השגיאה ל־callback`);
  }
  assert.equal(c.length, 1);
  assert.ok(c[0].args[0] instanceof TypeError, "הארגומנט הראשון צריך להיות השגיאה של JSON.stringify");
  assert.equal(c[0].sync, false, "ה־callback נקרא לפני ש־saveJson חזרה — עטוף ב־setTimeout(..., 0)");
  assert.equal(fs.existsSync(t.p("b.json")), false, "אחרי שגיאה לא כותבים קובץ");
});
test("תיקייה שלא קיימת ← שגיאת הכתיבה, פעם אחת", async () => {
  const { saveJson } = await get();
  const c = await calls((cb) => saveJson(t.p("no-dir/x.json"), { a: 1 }, cb));
  assert.equal(c.length, 1);
  assert.equal(c[0].args[0]?.code, "ENOENT");
});
