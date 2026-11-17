import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { createSlidingLimiter } = await load(import.meta.url, "P27-E54.ts");

test("חלון נע, נדחות לא נרשמות", () => {
  const l = createSlidingLimiter({ limit: 3, windowMs: 1000 });
  assert.deepEqual([0, 100, 200, 300].map((t) => l.hit("a", t)), [true, true, true, false]);
  assert.equal(l.tracked("a"), 3);
  assert.equal(l.hit("b", 300), true, "לקוח אחר");
  assert.equal(l.hit("a", 999), false);
  assert.equal(l.hit("a", 1000), true, "0 יצא מהחלון (now − 1000 לא כולל)");
  assert.equal(l.hit("a", 1050), false);
  assert.equal(l.hit("a", 1100), true);
  assert.equal(l.tracked("a"), 3);
  assert.equal(l.hit("a", 5000), true);
  assert.equal(l.tracked("a"), 1);
  l.hit("c", 0);
  l.hit("d", 10_000);
  assert.equal(l.tracked("c"), 1);
  l.hit("c", 20_000);
  assert.equal(l.tracked("c"), 1);
});
test("לקוח שנעלם לא תופס זיכרון; 300,000 — מהר", () => {
  const l = createSlidingLimiter({ limit: 10, windowMs: 1000 });
  l.hit("x", 0);
  l.hit("y", 5000);
  assert.equal(l.tracked("x"), 1);
  const l2 = createSlidingLimiter({ limit: 50, windowMs: 60_000 });
  let allowed = 0;
  fastEnough(() => { for (let i = 0; i < 300_000; i++) if (l2.hit(`c${i % 1000}`, i)) allowed++; }, 300, "300,000 hits");
  assert.ok(allowed > 0 && allowed < 300_000);
});
