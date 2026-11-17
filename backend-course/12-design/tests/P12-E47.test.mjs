import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E47.ts";
const get = () => exportsOf(import.meta.url, FILE, ["Shape", "Circle", "Rect", "totalArea"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("Circle ו־Rect הם Shape", () => {
  const r = typeProbe(import.meta.url, FILE, `import { Shape, Circle, Rect, totalArea } from "FILE";
const list: Shape[] = [new Circle(1), new Rect(1, 2)];
const t: number = totalArea(list);
const d: string = list[0].describe();
// @ts-expect-error — label הוא readonly
list[0].label = "x";
export { t, d };
`);
  assert.ok(r.ok, r.message);
});
test("שטחים ותיאורים", async () => {
  const { Circle, Rect, Shape } = await get();
  assert.equal(new Rect(2, 3).describe(), "מלבן: 6.00");
  assert.equal(new Rect(2, 2).describe(), "ריבוע: 4.00");
  assert.equal(new Circle(1).describe(), "עיגול: 3.14");
  assert.equal(new Circle(2).area(), Math.PI * 4);
  assert.ok(new Circle(1) instanceof Shape, "Circle צריכה לרשת מ־Shape (extends)");
  assert.ok(new Rect(1, 1) instanceof Shape, "Rect צריכה לרשת מ־Shape (extends)");
  assert.equal(new Rect(2, 3).label, "מלבן");
});
test("Shape בלי area — זורקת", async () => {
  const { Shape } = await get();
  const s = new Shape("משהו");
  assert.equal(s.label, "משהו");
  assert.throws(() => s.area(), { message: "area לא מומשה" });
  assert.throws(() => s.describe(), { message: "area לא מומשה" }, "describe צריכה להשתמש ב־this.area()");
});
test("describe כתובה פעם אחת — באב", async () => {
  const { Circle, Rect, Shape } = await get();
  assert.ok(!Object.prototype.hasOwnProperty.call(Circle.prototype, "describe"), "אל תכתוב describe מחדש ב־Circle — היא נורשת מ־Shape");
  assert.ok(!Object.prototype.hasOwnProperty.call(Rect.prototype, "describe"), "אל תכתוב describe מחדש ב־Rect — היא נורשת מ־Shape");
  class Tri extends Shape { constructor() { super("משולש"); } area() { return 1.234; } }
  assert.equal(new Tri().describe(), "משולש: 1.23");
});
test("totalArea", async () => {
  const { Circle, Rect, totalArea } = await get();
  assert.equal(totalArea([]), 0);
  assert.equal(totalArea([new Rect(2, 3), new Rect(1, 1)]), 7);
  assert.equal(totalArea([new Circle(1), new Rect(1, 2)]), Math.PI + 2);
});
