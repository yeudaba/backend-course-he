import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E33.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["Score"])).Score;
const MSG = "ניקוד חייב להיות מספר שלם חיובי";

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("points קריאה בלבד", () => {
  const r = typeProbe(import.meta.url, FILE, `import { Score } from "FILE";
const s = new Score();
const p: number = s.points;
// @ts-expect-error — points הוא getter בלבד; משנים רק דרך add
s.points = 100;
// @ts-expect-error — add מקבלת מספר
s.add("5");
export { p };
`);
  assert.ok(r.ok, r.message);
});
test("add ו־reset", async () => {
  const Score = await get();
  const s = new Score();
  assert.equal(s.points, 0);
  s.add(10);
  s.add(5);
  assert.equal(s.points, 15);
  s.reset();
  assert.equal(s.points, 0);
  s.add(1);
  assert.equal(s.points, 1);
});
test("ניקוד לא תקין ← RangeError, והניקוד לא משתנה", async () => {
  const Score = await get();
  const s = new Score();
  s.add(7);
  for (const bad of [0, -3, 2.5, NaN, Infinity]) {
    assert.throws(() => s.add(bad), (e) => e instanceof RangeError && e.message === MSG, `add(${bad})`);
  }
  assert.equal(s.points, 7);
});
test("כל מופע עם ניקוד משלו, והניקוד לא גלוי מבחוץ", async () => {
  const Score = await get();
  const a = new Score();
  const b = new Score();
  a.add(3);
  assert.equal(b.points, 0);
  assert.deepEqual(Object.keys(a), [], "השדה צריך להיות פרטי (#points)");
});
