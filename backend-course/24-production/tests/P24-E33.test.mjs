import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, code } from "./_ts.mjs";

const FILE = "P24-E33.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["ErrorRateAlarm"])).ErrorRateAlarm;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שיעור שגיאות ו־minRequests", async () => {
  const ErrorRateAlarm = await get();
  let now = 0;
  const a = new ErrorRateAlarm({ windowMs: 60_000, threshold: 0.1, minRequests: 20 }, () => now);
  assert.equal(a.errorRate, 0, "בלי בקשות — 0, לא NaN");
  assert.equal(a.shouldAlert(), false);
  for (let i = 0; i < 18; i++) a.record(200);
  a.record(404);
  a.record(500);
  assert.equal(a.count, 20, "count הוא getter");
  assert.equal(a.errorRate, 0.05, "404 היא לא שגיאת שרת");
  assert.equal(a.shouldAlert(), false);
  a.record(503);
  assert.equal(a.count, 21);
  assert.equal(a.shouldAlert(), false, "2/21 < 10%");
  a.record(500);
  assert.equal(a.errorRate, 3 / 22);
  assert.equal(a.shouldAlert(), true);
  const quiet = new ErrorRateAlarm({ windowMs: 60_000, threshold: 0.1, minRequests: 20 }, () => now);
  quiet.record(500);
  quiet.record(500);
  assert.equal(quiet.errorRate, 1);
  assert.equal(quiet.shouldAlert(), false, "שתי בקשות בלבד — פחות מ־minRequests");
});
test("חלון זמן: בדיוק בגבול כבר לא בחלון", async () => {
  const ErrorRateAlarm = await get();
  let now = 1000;
  const a = new ErrorRateAlarm({ windowMs: 100, threshold: 0.5, minRequests: 1 }, () => now);
  a.record(500);
  now = 1050;
  a.record(200);
  assert.equal(a.count, 2);
  now = 1099;
  assert.equal(a.count, 2);
  now = 1100;
  assert.equal(a.count, 1, "בקשה מלפני windowMs בדיוק — כבר לא בחלון");
  assert.equal(a.errorRate, 0);
  now = 5000;
  assert.equal(a.count, 0);
  assert.equal(a.shouldAlert(), false);
});
test("threshold לא תקין ← RangeError, שעון ברירת מחדל, שדות פרטיים", async () => {
  const ErrorRateAlarm = await get();
  for (const threshold of [0, -0.1, 1.5, NaN]) {
    assert.throws(() => new ErrorRateAlarm({ windowMs: 1000, threshold, minRequests: 1 }), RangeError, `threshold=${threshold}`);
  }
  const a = new ErrorRateAlarm({ windowMs: 60_000, threshold: 1, minRequests: 1 });
  a.record(500);
  assert.equal(a.shouldAlert(), true, "threshold של 1 מותר; שעון ברירת מחדל Date.now()");
  assert.deepEqual(Object.keys(a), [], `יש שדות ציבוריים (${Object.keys(a).join(", ")}) — השתמש ב־#`);
});
test("#prune עם while", () => {
  const c = code(import.meta.url, FILE);
  assert.match(c, /#prune\s*\(/, "מתודה פרטית #prune()");
  assert.match(c, /\bwhile\s*\(/, "המחיקה עם while (פרק 4)");
});
