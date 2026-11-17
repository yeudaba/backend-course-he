import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";
import { tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E74.js", ["loadSettings"]);
const t = tmpFiles({ "a.json": '{"port": 8080, "name": "shop"}', "bad.json": "{oops", "empty.json": "{}" });

test("הקובץ מנצח, השאר מ־defaults, ו־defaults לא משתנה", async () => {
  const { loadSettings } = await get();
  const defaults = { port: 3000, debug: false };
  const s = await loadSettings(t.p("a.json"), defaults);
  assert.deepEqual(s, { port: 8080, debug: false, name: "shop" });
  assert.deepEqual(defaults, { port: 3000, debug: false }, "defaults השתנה — צור אובייקט חדש (spread)");
  assert.deepEqual(await loadSettings(t.p("empty.json"), defaults), defaults);
});
test("קובץ חסר ← עותק של defaults", async () => {
  const { loadSettings } = await get();
  const defaults = { port: 3000 };
  const s = await loadSettings(t.p("nope.json"), defaults);
  assert.deepEqual(s, { port: 3000 });
  assert.notEqual(s, defaults, "צריך להחזיר עותק חדש, לא את defaults עצמו");
});
test("שגיאות אחרות עוברות הלאה", async () => {
  const { loadSettings } = await get();
  await assert.rejects(loadSettings(t.p("bad.json"), {}), SyntaxError, "JSON שבור צריך להיכשל, לא להחזיר defaults");
  await assert.rejects(loadSettings(t.dir, {}), (e) => e.code === "EISDIR", "תיקייה במקום קובץ צריכה להיכשל");
});
test("then/catch בלבד", () => {
  assert.ok(!/\bawait\b|\basync\b/.test(code(import.meta.url, "P10-E74.js")), "בתרגיל הזה — then/catch, בלי async/await");
});
