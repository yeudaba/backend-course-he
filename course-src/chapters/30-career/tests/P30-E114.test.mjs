import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { takeHomePlan } = await load(import.meta.url, "P30-E114.ts");
const T = [
  { id: "readme", hours: 0.5, priority: "must" },
  { id: "auth", hours: 1, priority: "nice" },
  { id: "api", hours: 2, priority: "must" },
  { id: "docker", hours: 0.75, priority: "should" },
  { id: "double-booking-test", hours: 0.5, priority: "must" },
  { id: "openapi", hours: 0.5, priority: "should" },
  { id: "pagination", hours: 0.25, priority: "nice" },
];

test("must תמיד; should ואז nice — כל מה שנכנס", () => {
  assert.deepEqual(takeHomePlan(T, 4), { plan: ["readme", "api", "docker", "double-booking-test", "pagination"], wontDo: ["auth", "openapi"], hours: 4, overBudget: false });
  assert.deepEqual(takeHomePlan(T, 3.5), { plan: ["readme", "api", "double-booking-test", "openapi"], wontDo: ["auth", "docker", "pagination"], hours: 3.5, overBudget: false }, "docker לא נכנס, openapi כן");
});
test("must מעבר לתקציב, עיגולים, שגיאות", () => {
  assert.deepEqual(takeHomePlan(T, 2), { plan: ["readme", "api", "double-booking-test"], wontDo: ["auth", "docker", "openapi", "pagination"], hours: 3, overBudget: true });
  assert.deepEqual(takeHomePlan([{ id: "a", hours: 0.1, priority: "should" }, { id: "b", hours: 0.2, priority: "should" }], 0.3).plan, ["a", "b"], "0.1 + 0.2 נכנס ב־0.3");
  assert.deepEqual(takeHomePlan([], 3), { plan: [], wontDo: [], hours: 0, overBudget: false });
  assert.throws(() => takeHomePlan(T, -1), RangeError);
  assert.throws(() => takeHomePlan([{ id: "x", hours: NaN, priority: "must" }], 3), RangeError);
});
test("משימה של 0 שעות — תקינה", () => {
  assert.doesNotThrow(() => takeHomePlan([{ id: "note", hours: 0, priority: "must" }], 1));
});
