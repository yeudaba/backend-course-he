import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { createBudget } = await load(import.meta.url, "P29-E17.ts");

test("עד התקרה מותר, אחריה לא; לכל משתמש לבד", () => {
  let t = Date.parse("2026-11-08T10:00:00Z");
  const b = createBudget({ dailyUsdPerUser: 0.05, now: () => t });
  for (let i = 0; i < 4; i++) b.record("dana", 0.0125);
  assert.deepEqual(b.check("dana"), { allowed: false, remainingUsd: 0 });
  assert.deepEqual(b.check("yossi"), { allowed: true, remainingUsd: 0.05 });
});
test("בלי שגיאות עיגול: 0.1 + 0.2", () => {
  const b = createBudget({ dailyUsdPerUser: 0.3, now: () => 0 });
  b.record("a", 0.1);
  b.record("a", 0.2);
  assert.deepEqual(b.check("a"), { allowed: false, remainingUsd: 0 });
});
test("מתאפס בחצות UTC", () => {
  let t = Date.parse("2026-11-08T23:59:00Z");
  const b = createBudget({ dailyUsdPerUser: 1, now: () => t });
  b.record("dana", 1);
  assert.equal(b.check("dana").allowed, false);
  t = Date.parse("2026-11-09T00:00:00Z");
  assert.deepEqual(b.check("dana"), { allowed: true, remainingUsd: 1 });
});
test("עלות שלילית או NaN ← שגיאה", () => {
  const b = createBudget({ dailyUsdPerUser: 1 });
  assert.throws(() => b.record("a", -1));
  assert.throws(() => b.record("a", NaN));
});
