import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { forecastMonth, budgetAlerts } = await load(import.meta.url, "P26.3-E38.ts");

test("forecastMonth", () => {
  assert.equal(forecastMonth([1, 2, 3], 30), 60);
  assert.equal(forecastMonth([0.1, 0.2], 31), 4.65);
  assert.equal(forecastMonth([10], 1), 10);
  assert.equal(forecastMonth([], 30), 0);
});
test("budgetAlerts", () => {
  const days = [0.5, 0.5, 1, 1, 0.5, 1.5]; // מצטבר: 0.5, 1, 2, 3, 3.5, 5
  assert.deepEqual(budgetAlerts(days, 5), [{ threshold: 0.5, day: 4 }, { threshold: 0.8, day: 6 }, { threshold: 1, day: 6 }]);
  assert.deepEqual(budgetAlerts(days, 4), [{ threshold: 0.5, day: 3 }, { threshold: 0.8, day: 5 }, { threshold: 1, day: 6 }], "בדיוק בסף — נחשב");
  assert.deepEqual(budgetAlerts(days, 100), []);
  assert.deepEqual(budgetAlerts([0.1, 0.2, 0.3], 1, [0.3, 0.6]), [{ threshold: 0.3, day: 2 }, { threshold: 0.6, day: 3 }]);
});
