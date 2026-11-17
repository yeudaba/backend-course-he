import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E61.mjs", ["withLock"])).withLock;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test("נועל, מחזיר תוצאה ומשחרר", async () => {
  const withLock = await get();
  const button = { disabled: false, textContent: "שמירה" };
  const calls = [];
  const h = withLock(button, async (a, b) => {
    calls.push([a, b]);
    await sleep(30);
    return a + b;
  });
  const p = h(2, 3);
  assert.equal(button.disabled, true, "נעול מיד");
  assert.equal(button.textContent, "שולח...");
  assert.equal(await h(9, 9), undefined, "לחיצה בזמן נעילה ← undefined");
  assert.equal(await p, 5, "מחזירה את התוצאה, עם כל הארגומנטים");
  assert.deepEqual(calls, [[2, 3]], "fn נקראה פעם אחת");
  assert.equal(button.disabled, false);
  assert.equal(button.textContent, "שמירה", "הטקסט המקורי חזר");
});
test("לא משחרר לפני ש־fn הסתיימה", async () => {
  const withLock = await get();
  const button = { disabled: false, textContent: "x" };
  let done = false;
  const p = withLock(button, async () => {
    await sleep(40);
    done = true;
  })();
  await sleep(10);
  assert.equal(button.disabled, true, "עדיין נעול באמצע (return await בתוך try)");
  await p;
  assert.ok(done);
  assert.equal(button.disabled, false);
});
test("שגיאה — משחרר וזורק הלאה", async () => {
  const withLock = await get();
  const button = { disabled: false, textContent: "הוספה" };
  const h = withLock(button, async () => {
    await sleep(5);
    throw new Error("כותרת ריקה");
  });
  await assert.rejects(h(), { message: "כותרת ריקה" });
  assert.equal(button.disabled, false);
  assert.equal(button.textContent, "הוספה");
  const sync = withLock(button, () => {
    throw new Error("סינכרוני");
  });
  await assert.rejects(sync(), { message: "סינכרוני" });
  assert.equal(button.disabled, false);
});
test("כפתור שנעול מראש", async () => {
  const withLock = await get();
  let called = false;
  const button = { disabled: true, textContent: "x" };
  assert.equal(await withLock(button, () => (called = true))(), undefined);
  assert.equal(called, false);
  assert.equal(button.disabled, true, "לא משחרר כפתור שנעל מישהו אחר");
});
