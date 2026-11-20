import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { chunk } = await load(import.meta.url, "P28.5-E104.ts");

// מקור של מיליון איברים שסופר כמה נלקחו ממנו
function counted(total) {
  const stats = { pulled: 0 };
  function* gen() {
    for (let i = 0; i < total; i++) {
      stats.pulled++;
      yield i;
    }
  }
  return { source: gen(), stats };
}

test("מערך: חתיכות מלאות, ואחרונה קצרה", () => {
  assert.equal(typeof chunk, "function", "צריך לייצא chunk");
  assert.deepEqual([...chunk([1, 2, 3, 4, 5], 2)], [[1, 2], [3, 4], [5]], "5 איברים בחתיכות של 2 — גם ה־5 בחתיכה משלו");
  assert.deepEqual([...chunk([1, 2, 3, 4], 2)], [[1, 2], [3, 4]], "בלי חתיכה ריקה בסוף כשהחלוקה מדויקת");
  assert.deepEqual([...chunk([1, 2, 3], 10)], [[1, 2, 3]], "size גדול מהמקור ← חתיכה אחת");
  assert.deepEqual([...chunk([7, 8, 9], 1)], [[7], [8], [9]]);
  assert.deepEqual([...chunk([], 3)], [], "מקור ריק ← אף חתיכה");
});

test("כל iterable: Set, מחרוזת, generator", () => {
  assert.deepEqual([...chunk(new Set([1, 2, 3, 4, 5]), 2)], [[1, 2], [3, 4], [5]], "Set אין slice — צריך for...of");
  assert.deepEqual([...chunk("abcd", 3)], [["a", "b", "c"], ["d"]], "מחרוזת");
  const { source } = counted(7);
  assert.deepEqual([...chunk(source, 3)], [[0, 1, 2], [3, 4, 5], [6]], "generator כמקור");
});

test("עצל: לוקח מהמקור רק מה שצריך", () => {
  const { source, stats } = counted(1_000_000);
  const g = chunk(source, 4);
  assert.equal(stats.pulled, 0, "chunk(...) עצמו לא אמור לקחת אף איבר — רק next()");
  assert.deepEqual(g.next().value, [0, 1, 2, 3]);
  assert.equal(stats.pulled, 4, `החתיכה הראשונה צריכה לקחת בדיוק 4 איברים, נלקחו ${stats.pulled} (‏[...source] או Array.from טוענים הכול)`);
  assert.deepEqual(g.next().value, [4, 5, 6, 7]);
  assert.equal(stats.pulled, 8, "אחרי שתי חתיכות — 8 איברים");
});

test("כל חתיכה היא מערך נפרד", () => {
  const parts = [...chunk([1, 2, 3, 4, 5, 6], 2)];
  assert.notEqual(parts[0], parts[1], "אותו מערך הוחזר פעמיים — צריך buf = [] ולא buf.length = 0");
  assert.deepEqual(parts, [[1, 2], [3, 4], [5, 6]]);
});

test("size לא תקין ← RangeError", () => {
  assert.throws(() => [...chunk([1, 2], 0)], RangeError, "size 0 ← RangeError (אחרת לולאה אינסופית או חתיכות ריקות)");
  assert.throws(() => [...chunk([1, 2], -2)], RangeError, "size שלילי ← RangeError");
  assert.throws(() => [...chunk([1, 2], 1.5)], RangeError, "size לא שלם ← RangeError");
});
