import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E39.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["Gradebook"])).Gradebook;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { Gradebook } from "FILE";
const g = new Gradebook();
g.add("a", 90);
const avg: number = g.average("a");
const t: { student: string; average: number }[] = g.top(1);
const n: number = g.students;
// @ts-expect-error — ציון הוא מספר
g.add("a", "90");
export { avg, t, n };
`);
  assert.ok(r.ok, r.message);
});
test("add ו־average", async () => {
  const Gradebook = await get();
  const g = new Gradebook();
  g.add("דנה", 90);
  g.add("דנה", 85);
  g.add(" דנה ", 80);
  assert.equal(g.average("דנה"), 85);
  g.add("עומר", 100);
  g.add("עומר", 99);
  g.add("עומר", 99);
  assert.equal(g.average("עומר"), 99.3, "מעוגל לספרה אחת");
  assert.equal(g.students, 2);
  assert.throws(() => g.average("נועה"), { message: "אין ציונים ל־נועה" });
});
test("ציונים ושמות לא תקינים", async () => {
  const Gradebook = await get();
  const g = new Gradebook();
  for (const bad of [-1, 101, 85.5, NaN]) {
    assert.throws(() => g.add("a", bad), (e) => e instanceof RangeError && e.message === `ציון לא תקין: ${bad}`, `add("a", ${bad})`);
  }
  assert.throws(() => g.add("  ", 90), { message: "שם ריק" });
  assert.equal(g.students, 0, "ציון לא תקין לא יוצר תלמיד");
  g.add("a", 0);
  g.add("a", 100);
  assert.equal(g.average("a"), 50);
});
test("top — מהגבוה לנמוך, שוויון לפי שם", async () => {
  const Gradebook = await get();
  const g = new Gradebook();
  g.add("c", 80);
  g.add("a", 90);
  g.add("b", 90);
  g.add("d", 95);
  assert.deepEqual(g.top(3), [{ student: "d", average: 95 }, { student: "a", average: 90 }, { student: "b", average: 90 }]);
  assert.equal(g.top(10).length, 4);
  assert.deepEqual(g.top(0), []);
  assert.deepEqual(new Gradebook().top(3), []);
});
