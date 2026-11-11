import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E37.js", ["afterAll"]);

function run(afterAll, delays) {
  return new Promise((resolve) => {
    const calls = [];
    let returned = false;
    const start = Date.now();
    afterAll(delays, (order) => {
      calls.push({ order, sync: !returned, ms: Date.now() - start });
      setTimeout(() => resolve(calls), 30);
    });
    returned = true;
    setTimeout(() => resolve(calls), 300);
  });
}

test("done נקראת פעם אחת, אחרי הטיימר האחרון, עם הסדר בפועל", async () => {
  const { afterAll } = await get();
  const calls = await run(afterAll, [30, 10, 20]);
  assert.equal(calls.length, 1, `done נקראה ${calls.length} פעמים (צריך פעם אחת)`);
  assert.deepEqual(calls[0].order, [10, 20, 30]);
  assert.ok(calls[0].ms >= 25, `done נקראה אחרי ${calls[0].ms}ms — לפני שהטיימר של 30 רץ`);
});
test("סדר אחר, וזמנים שווים", async () => {
  const { afterAll } = await get();
  const calls = await run(afterAll, [5, 40, 5, 15]);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].order, [5, 5, 15, 40]);
});
test("מערך ריק — done([]) בטיימר, לא מיד", async () => {
  const { afterAll } = await get();
  const calls = await run(afterAll, []);
  assert.equal(calls.length, 1, "עם מערך ריק done עדיין צריכה להיקרא, פעם אחת");
  assert.deepEqual(calls[0].order, []);
  assert.equal(calls[0].sync, false, "done נקראה לפני ש־afterAll חזרה — גם המקרה הריק בטיימר של 0");
});
