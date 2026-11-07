import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { formatLine, calcTotals } = await load(import.meta.url, "P05-E19.js");

test("formatLine — דוגמה", () => assert.equal(formatLine("mouse", 89.9), "MOUSE...............   89.90"));
test("formatLine — אורך מדויק", () => { assert.equal(formatLine("keyboard", 249).length, 28); assert.equal(formatLine("x", 1, 20).length, 20); });
test("calcTotals", () => { assert.equal(calcTotals(358.4, 10, 0.18), 380.62); assert.equal(calcTotals(100, 0, 0), 100); });
test("calcTotals מחזירה מספר", () => assert.equal(typeof calcTotals(10, 0, 0.18), "number"));
