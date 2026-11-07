import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { bestDay, averageOrderValue, daysAbove, reportLines } = await load(import.meta.url, "P06-E24.js");

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const orders = [12, 8, 10, 9, 15, 16, 0];
const revenue = [1840, 1100, 1390, 1200, 1950, 1850, 0];
test("bestDay", () => assert.equal(bestDay(days, revenue), "חמישי"));
test("averageOrderValue", () => { assert.equal(averageOrderValue(orders, revenue), 133.29); assert.equal(averageOrderValue([0, 0], [0, 0]), 0); });
test("daysAbove (מעל, לא כולל)", () => assert.deepEqual(daysAbove(days, revenue, 1840), ["חמישי", "שישי"]));
test("reportLines", () => {
  const lines = reportLines(days, orders, revenue);
  assert.equal(lines.length, 8);
  assert.equal(lines[0], "ראשון: 12 הזמנות, ₪1,840");
  assert.equal(lines[6], "שבת: 0 הזמנות, ₪0");
  assert.equal(lines[7], "סה״כ: 70 הזמנות, ₪9,330");
});
