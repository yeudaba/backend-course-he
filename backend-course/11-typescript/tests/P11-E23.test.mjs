import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { loadSettings } = await load(import.meta.url, "P11-E23.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E23.ts"); assert.ok(r.ok, r.output); });
test("ברירות מחדל", () => { assert.deepEqual(loadSettings("{}"), { theme: "light", pageSize: 20 }); assert.deepEqual(loadSettings('{"theme":"dark"}'), { theme: "dark", pageSize: 20 }); });
test("גבולות הטווח (1 ו־100) תקינים", () => { assert.deepEqual(loadSettings('{"pageSize":1}'), { theme: "light", pageSize: 1 }); assert.deepEqual(loadSettings('{"pageSize":100}'), { theme: "light", pageSize: 100 }); });
test("תקין", () => assert.deepEqual(loadSettings('{"theme":"dark","pageSize":50,"extra":1}'), { theme: "dark", pageSize: 50 }));
test("לא תקין", () => {
  assert.throws(() => loadSettings('{"pageSize":"20"}'), { message: "הגדרה לא תקינה: pageSize" });
  assert.throws(() => loadSettings('{"pageSize":500}'), { message: "הגדרה לא תקינה: pageSize" });
  assert.throws(() => loadSettings('{"theme":"blue"}'), { message: "הגדרה לא תקינה: theme" });
  assert.throws(() => loadSettings('{"pageSize":0}'), { message: "הגדרה לא תקינה: pageSize" }, "pageSize 0 — מחוץ לטווח 1–100");
  assert.throws(() => loadSettings('{"pageSize":101}'), { message: "הגדרה לא תקינה: pageSize" }, "pageSize 101 — מחוץ לטווח 1–100");
  assert.throws(() => loadSettings('{"pageSize":2.5}'), { message: "הגדרה לא תקינה: pageSize" }, "pageSize 2.5 — גודל עמוד הוא מספר שלם");
  assert.throws(() => loadSettings("[1]"), { message: "הגדרה לא תקינה: root" });
});
