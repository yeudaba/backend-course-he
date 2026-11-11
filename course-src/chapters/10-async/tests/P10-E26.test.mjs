import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E26.js", ["addLater"]);

// קורא ל־addLater, ומחכה עוד קצת כדי לראות אם ה־callback נקרא פעם שנייה
function call(addLater, a, b) {
  return new Promise((resolve) => {
    const calls = [];
    let returned = false;
    const start = Date.now();
    addLater(a, b, (...args) => {
      calls.push({ args, sync: !returned, ms: Date.now() - start });
      if (calls.length === 1) setTimeout(() => resolve(calls), 40);
    });
    returned = true;
    setTimeout(() => resolve(calls), 300);
  });
}

test("2 + 3 ← callback(null, 5)", async () => {
  const { addLater } = await get();
  const calls = await call(addLater, 2, 3);
  assert.equal(calls.length, 1, `ה־callback נקרא ${calls.length} פעמים (צריך בדיוק פעם אחת)`);
  assert.deepEqual(calls[0].args, [null, 5], "error-first: הארגומנט הראשון null, השני התוצאה");
});
test("אחרי המתנה, לא מיד", async () => {
  const { addLater } = await get();
  const [first] = await call(addLater, 1, 1);
  assert.ok(first, "ה־callback לא נקרא");
  assert.equal(first.sync, false, "ה־callback נקרא לפני ש־addLater חזרה — הכנס את הקוד לתוך setTimeout");
  assert.ok(first.ms >= 8, `ה־callback נקרא אחרי ${first.ms}ms — צריך לחכות 10ms`);
});
test("קלט לא תקין ← TypeError, גם הוא אחרי ההמתנה ופעם אחת", async () => {
  const { addLater } = await get();
  for (const [a, b] of [[2, "3"], [undefined, 1], [null, 2]]) {
    const calls = await call(addLater, a, b);
    assert.equal(calls.length, 1, `addLater(${a}, ${JSON.stringify(b)}): ה־callback נקרא ${calls.length} פעמים (שכחת return אחרי השגיאה?)`);
    const [err] = calls[0].args;
    assert.ok(err instanceof TypeError, "הארגומנט הראשון צריך להיות TypeError");
    assert.equal(err.message, "a ו־b חייבים להיות מספרים");
    assert.equal(calls[0].sync, false, "גם השגיאה צריכה להגיע אחרי ההמתנה, לא מיד");
  }
});
