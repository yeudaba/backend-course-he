// P22-E25 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { SlidingWindowLimiter } from "./P22-E25.ts";

function setup(limit = 3, windowMs = 10_000) {
  const clock = { t: 1_000_000, now() { return this.t; } };
  return { limiter: new SlidingWindowLimiter(limit, windowMs, clock), clock };
}

test("עד limit בקשות; remaining יורד", () => {
  const { limiter } = setup();
  assert.deepEqual([1, 2, 3].map(() => limiter.hit("a").remaining), [2, 1, 0]);
  assert.deepEqual(limiter.hit("a"), { allowed: false, remaining: 0, retryAfterMs: 10_000 });
});

test("החלון נע: בקשה ישנה יוצאת בדיוק אחרי windowMs", () => {
  const { limiter, clock } = setup();
  limiter.hit("a"); // t=0
  clock.t += 4_000;
  limiter.hit("a"); // t=4s
  limiter.hit("a");
  clock.t += 5_999; // t=9.999s
  assert.equal(limiter.hit("a").allowed, false);
  clock.t += 1; // t=10s — הראשונה יצאה
  assert.equal(limiter.hit("a").allowed, true);
});

test("retryAfterMs — עד שהבקשה הוותיקה יוצאת", () => {
  const { limiter, clock } = setup();
  limiter.hit("a");
  clock.t += 3_000;
  limiter.hit("a");
  limiter.hit("a");
  clock.t += 1_000;
  assert.equal(limiter.hit("a").retryAfterMs, 6_000);
});

test("בקשה שנדחתה לא נספרת", () => {
  const { limiter, clock } = setup(1, 1_000);
  limiter.hit("a");
  clock.t += 500;
  assert.equal(limiter.hit("a").allowed, false);
  clock.t += 500;
  assert.equal(limiter.hit("a").allowed, true, "הדחויה ב־500 לא מאריכה את החסימה");
});

test("כל מפתח — לבד", () => {
  const { limiter } = setup(1);
  assert.equal(limiter.hit("a").allowed, true);
  assert.equal(limiter.hit("b").allowed, true);
  assert.equal(limiter.hit("a").allowed, false);
});
