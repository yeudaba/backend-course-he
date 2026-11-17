// P22-E81 — בדיקות ל־LoginLimiter
import { test } from "node:test";
import assert from "node:assert/strict";
import { LoginLimiter } from "./P22-E81.ts";

const MIN = 60_000;
function setup() {
  const clock = { t: 0 };
  return { clock, limiter: new LoginLimiter(() => clock.t) };
}

test("4 כישלונות — עוד לא נעול; 5 — נעול ל־15 דקות מהראשון", () => {
  const { clock, limiter } = setup();
  for (let i = 0; i < 4; i++) {
    limiter.recordFailure("dana@example.com");
    clock.t += MIN;
  }
  assert.equal(limiter.retryAfterSeconds("dana@example.com"), 0);
  limiter.recordFailure("dana@example.com"); // דקה 4
  assert.equal(limiter.retryAfterSeconds("dana@example.com"), 11 * 60);
  clock.t = 15 * MIN - 500;
  assert.equal(limiter.retryAfterSeconds("dana@example.com"), 1, "מעוגל למעלה");
  clock.t = 15 * MIN;
  assert.equal(limiter.retryAfterSeconds("dana@example.com"), 0, "בדיוק 15 דקות אחרי הראשון — פתוח");
});

test("כישלונות ישנים לא נספרים", () => {
  const { clock, limiter } = setup();
  limiter.recordFailure("dana@example.com");
  clock.t = 16 * MIN;
  for (let i = 0; i < 4; i++) limiter.recordFailure("dana@example.com");
  assert.equal(limiter.retryAfterSeconds("dana@example.com"), 0);
});

test("בלי תלות באותיות, ולכל אימייל בנפרד", () => {
  const { limiter } = setup();
  for (let i = 0; i < 5; i++) limiter.recordFailure(i % 2 ? "Dana@Example.com" : "dana@example.com");
  assert.ok(limiter.retryAfterSeconds("DANA@example.com") > 0);
  assert.equal(limiter.retryAfterSeconds("yossi@example.com"), 0);
});

test("reset", () => {
  const { limiter } = setup();
  for (let i = 0; i < 5; i++) limiter.recordFailure("dana@example.com");
  limiter.reset("dana@example.com");
  assert.equal(limiter.retryAfterSeconds("dana@example.com"), 0);
  for (let i = 0; i < 4; i++) limiter.recordFailure("dana@example.com");
  assert.equal(limiter.retryAfterSeconds("dana@example.com"), 0, "אחרי reset סופרים מאפס");
});
