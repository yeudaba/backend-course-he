import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { ids, take } = await load(import.meta.url, "P28.5-E105.ts");

// מקור שסופר כמה נלקחו ממנו, ומסמן כשה־finally שלו רץ
function tracked(values) {
  const stats = { pulled: 0, closed: false };
  function* gen() {
    try {
      for (const v of values) {
        stats.pulled++;
        yield v;
      }
    } finally {
      stats.closed = true;
    }
  }
  return { source: gen(), stats };
}

test("ids: רצף אינסופי של מזהים", () => {
  assert.equal(typeof ids, "function", "צריך לייצא ids");
  const g = ids("ORD");
  assert.equal(typeof g.next, "function", "ids צריך להחזיר generator (function*)");
  assert.deepEqual([g.next().value, g.next().value, g.next().value], ["ORD-1", "ORD-2", "ORD-3"], "ברירת מחדל: מתחיל מ־1");
  const inv = ids("INV", 100);
  assert.deepEqual([inv.next().value, inv.next().value], ["INV-100", "INV-101"], "start = 100");
  const far = ids("X");
  let last;
  for (let i = 0; i < 5000; i++) last = far.next();
  assert.deepEqual(last, { value: "X-5000", done: false }, "ה־generator לא נגמר אף פעם");
});

test("take: n הראשונים", () => {
  assert.equal(typeof take, "function", "צריך לייצא take");
  assert.deepEqual(take(ids("ORD"), 3), ["ORD-1", "ORD-2", "ORD-3"]);
  assert.deepEqual(take([10, 20, 30, 40], 2), [10, 20], "גם על מערך");
  assert.deepEqual(take([10, 20], 5), [10, 20], "מקור קצר ← מה שיש");
  assert.deepEqual(take("שלום", 2), ["ש", "ל"], "גם על מחרוזת");
  assert.ok(Array.isArray(take(ids("A"), 1)), "take מחזיר מערך");
});

test("take לא לוקח איבר מיותר", () => {
  const a = tracked([1, 2, 3, 4, 5, 6]);
  assert.deepEqual(take(a.source, 3), [1, 2, 3]);
  assert.equal(a.stats.pulled, 3, `take(…, 3) צריך לקחת 3 איברים, נלקחו ${a.stats.pulled} — הבדיקה צריכה לבוא אחרי ה־push`);
  const z = tracked([1, 2, 3]);
  assert.deepEqual(take(z.source, 0), []);
  assert.equal(z.stats.pulled, 0, "n = 0 ← לא נוגעים במקור בכלל");
});

test("take סוגר את המקור כשהוא עוצר באמצע", () => {
  const a = tracked([1, 2, 3, 4, 5]);
  take(a.source, 2);
  assert.equal(a.stats.closed, true, "ה־finally של המקור לא רץ — עצירה באמצע צריכה break מתוך for...of (או return() ביד)");
  const b = tracked([1, 2]);
  assert.deepEqual(take(b.source, 10), [1, 2]);
  assert.equal(b.stats.closed, true, "גם כשהמקור נגמר — ה־finally שלו רץ");
});
