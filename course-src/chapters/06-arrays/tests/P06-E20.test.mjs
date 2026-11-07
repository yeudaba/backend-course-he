import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { summarize } = await load(import.meta.url, "P06-E20.js");

test("כולל את האיבר האחרון", () => assert.equal(summarize([100, 250, 40]), "3 מכירות, סה״כ 390, הגדולה ביותר 250"));
test("האחרון הוא הגדול", () => assert.equal(summarize([1, 2, 300]), "3 מכירות, סה״כ 303, הגדולה ביותר 300"));
test("רק החזרות (שליליים)", () => assert.equal(summarize([-20, -5]), "2 מכירות, סה״כ -25, הגדולה ביותר -5"));
test("רשימה ריקה", () => assert.equal(summarize([]), "אין מכירות"));
