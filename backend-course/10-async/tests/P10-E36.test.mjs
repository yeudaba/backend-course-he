import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E36.js", ["ticker"]);

function run(ticker, times, ms) {
  return new Promise((resolve) => {
    const events = [];
    const start = Date.now();
    ticker(times, ms, (n) => events.push({ e: n, ms: Date.now() - start }), () => {
      events.push({ e: "done", ms: Date.now() - start });
      setTimeout(() => resolve(events), 30);
    });
    setTimeout(() => resolve(events), 400);
  });
}

test("3 טיקים ואז onDone, במרווחים", async () => {
  const { ticker } = await get();
  const ev = await run(ticker, 3, 15);
  assert.deepEqual(ev.map((x) => x.e), [1, 2, 3, "done"], "צריך onTick(1), onTick(2), onTick(3), ואז onDone() — פעם אחת");
  assert.ok(ev[0].ms >= 12, `הטיק הראשון הגיע אחרי ${ev[0].ms}ms — גם לפניו מחכים ms`);
  assert.ok(ev[2].ms >= 40, `הטיק השלישי הגיע אחרי ${ev[2].ms}ms — צריך בערך 3 * ms`);
  assert.ok(ev[3].ms - ev[2].ms < 12, "onDone צריכה לבוא מיד אחרי הטיק האחרון, בלי המתנה נוספת");
});
test("times = 0 — רק onDone, אחרי ms", async () => {
  const { ticker } = await get();
  const ev = await run(ticker, 0, 10);
  assert.deepEqual(ev.map((x) => x.e), ["done"]);
  assert.ok(ev[0].ms >= 8, "גם onDone מחכה ms");
});
test("טיק אחד", async () => {
  const { ticker } = await get();
  const ev = await run(ticker, 1, 5);
  assert.deepEqual(ev.map((x) => x.e), [1, "done"]);
});
