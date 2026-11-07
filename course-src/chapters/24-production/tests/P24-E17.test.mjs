import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { TokenBucket } = await load(import.meta.url, "P24-E17.ts");
const setup = (capacity, refillPerSecond) => {
  const clock = { t: 1_000_000 };
  return { clock, b: new TokenBucket({ capacity, refillPerSecond, now: () => clock.t }) };
};

test("מתחיל מלא, ופרץ עד capacity", () => {
  const { b } = setup(3, 1);
  assert.deepEqual(b.take(), { allowed: true, remaining: 2, retryAfterSeconds: 0 });
  assert.deepEqual(b.take(), { allowed: true, remaining: 1, retryAfterSeconds: 0 });
  assert.deepEqual(b.take(), { allowed: true, remaining: 0, retryAfterSeconds: 0 });
  assert.deepEqual(b.take(), { allowed: false, remaining: 0, retryAfterSeconds: 1 });
});
test("מתמלא עם הזמן — ולא מעבר ל־capacity", () => {
  const { b, clock } = setup(3, 1);
  b.take(); b.take(); b.take();
  clock.t += 500;
  assert.equal(b.take().allowed, false, "חצי שנייה — חצי אסימון");
  clock.t += 500;
  assert.equal(b.take().allowed, true, "שנייה — אסימון שלם");
  clock.t += 60_000;
  assert.equal(b.take().remaining, 2, "אחרי דקה — מלא (3), לא 60");
});
test("retryAfterSeconds — לפי מה שחסר, מעוגל למעלה", () => {
  const { b, clock } = setup(10, 0.5); // אסימון כל 2 שניות
  for (let i = 0; i < 10; i++) b.take();
  assert.equal(b.take().retryAfterSeconds, 2);
  clock.t += 1500;
  assert.equal(b.take().retryAfterSeconds, 1, "חסר רבע אסימון = חצי שנייה ← 1");
  assert.equal(b.take(3).retryAfterSeconds, 5, "cost 3, יש 0.75 ← חסרים 2.25 ← 4.5 שניות ← 5");
});
test("נדחה — לא מוריד", () => {
  const { b, clock } = setup(2, 1);
  b.take(); b.take();
  for (let i = 0; i < 5; i++) assert.equal(b.take().allowed, false);
  clock.t += 1000;
  assert.equal(b.take().allowed, true, "ניסיונות שנדחו לא \"חפרו בור\"");
});
test("cost", () => {
  const { b } = setup(5, 1);
  assert.deepEqual(b.take(4), { allowed: true, remaining: 1, retryAfterSeconds: 0 });
  assert.equal(b.take(2).allowed, false);
  assert.throws(() => b.take(6), RangeError);
});
test("ערכים לא תקינים", () => {
  assert.throws(() => new TokenBucket({ capacity: 0, refillPerSecond: 1 }), RangeError);
  assert.throws(() => new TokenBucket({ capacity: 1, refillPerSecond: 0 }), RangeError);
});
