import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { pageTime } = await load(import.meta.url, "P28-E45.ts");

test("דף מוצר: משתמש ← הזמנות; מוצר ← המלצות", () => {
  const r = pageTime([
    { name: "user", ms: 20 },
    { name: "product", ms: 30 },
    { name: "orders", ms: 50, after: ["user"] },
    { name: "recs", ms: 15, after: ["product", "user"] },
    { name: "render", ms: 5, after: ["orders", "recs"] },
  ]);
  assert.deepEqual(r, { sequential: 120, parallel: 75, critical: ["user", "orders", "render"] });
});
test("בלי תלויות — המקסימום; תיקו — הראשון", () => {
  assert.deepEqual(pageTime([{ name: "a", ms: 10 }, { name: "b", ms: 40 }, { name: "c", ms: 40 }]), { sequential: 90, parallel: 40, critical: ["b"] });
  assert.deepEqual(pageTime([{ name: "x", ms: 10 }, { name: "y", ms: 10 }, { name: "z", ms: 1, after: ["y", "x"] }]).critical, ["y", "z"]);
  assert.deepEqual(pageTime([]), { sequential: 0, parallel: 0, critical: [] });
});
test("סדר הצעדים ברשימה לא חשוב", () => {
  const r = pageTime([{ name: "c", ms: 1, after: ["b"] }, { name: "b", ms: 2, after: ["a"] }, { name: "a", ms: 3 }]);
  assert.deepEqual(r, { sequential: 6, parallel: 6, critical: ["a", "b", "c"] });
});
test("שגיאות", () => {
  assert.throws(() => pageTime([{ name: "a", ms: 1, after: ["ghost"] }]), /ghost/);
  assert.throws(() => pageTime([{ name: "a", ms: 1, after: ["b"] }, { name: "b", ms: 1, after: ["a"] }]), /מעגל/);
});
test("שרשרת ארוכה — מהר (זיכרון תוצאות)", () => {
  const steps = [];
  for (let i = 0; i < 30; i++) steps.push({ name: `s${i}`, ms: 1, after: i ? [`s${i - 1}`, ...(i > 1 ? [`s${i - 2}`] : [])] : [] });
  const t0 = performance.now();
  assert.equal(pageTime(steps).parallel, 30);
  assert.ok(performance.now() - t0 < 500, "בלי Map של תוצאות זה מתפוצץ");
});
