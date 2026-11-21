import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E84.js", ["withLoading"]);
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

// task שאפשר לסיים מבחוץ — כדי לבדוק מה קרה "באמצע", לפני שהוא הסתיים
function controlled() {
  let finish;
  let fail;
  const promise = new Promise((resolve, reject) => {
    finish = resolve;
    fail = reject;
  });
  return { task: () => promise, finish: (v) => finish(v), fail: (e) => fail(e) };
}

test("הצלחה: true, ואחרי הסוף false — והערך חוזר", async () => {
  const { withLoading } = await get();
  const calls = [];
  const c = controlled();
  const result = withLoading(c.task, (on) => calls.push(on));
  assert.ok(result instanceof Promise, `withLoading צריכה להחזיר Promise (return task()...), וקיבלנו ${result === undefined ? "undefined — חסר return?" : typeof result}`);
  await sleep(10);
  assert.deepEqual(calls, [true], "בזמן שה־task עוד רץ, צריך להיות רק setLoading(true) — setLoading(false) נקרא לפני שה־task הסתיים");
  c.finish(42);
  assert.equal(await result, 42, "ה־Promise של withLoading צריך להצליח עם הערך של task");
  assert.deepEqual(calls, [true, false], "אחרי שה־task הסתיים: setLoading(true) ואז setLoading(false), פעם אחת כל אחד");
});
test("כישלון: גם אז false — והשגיאה עוברת הלאה", async () => {
  const { withLoading } = await get();
  const calls = [];
  const c = controlled();
  const result = withLoading(c.task, (on) => calls.push(on));
  await sleep(10);
  assert.deepEqual(calls, [true], "בזמן שה־task עוד רץ, צריך להיות רק setLoading(true)");
  const err = new Error("השרת לא עונה");
  c.fail(err);
  await assert.rejects(result, (e) => e === err, "כשה־task נכשל, withLoading צריכה להיכשל עם אותה שגיאה — לא לבלוע אותה");
  assert.deepEqual(calls, [true, false], "גם בכישלון: setLoading(false) בסוף — אחרת 'טוען...' נשאר דולק");
});
test("setLoading(true) לפני שה־task מתחיל", async () => {
  const { withLoading } = await get();
  const events = [];
  await withLoading(() => {
    events.push("task");
    return sleep(5, "ok");
  }, (on) => events.push(on));
  assert.deepEqual(events, [true, "task", false], "הסדר: setLoading(true), ואז task(), ובסוף setLoading(false)");
});
