import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { isAdult, isWeekend, canRent } = await load(import.meta.url, "P05-E09.js");

test("isAdult בגבולות", () => { assert.equal(isAdult(18), true); assert.equal(isAdult(17), false); assert.equal(isAdult(40), true); });
test("isWeekend", () => { assert.equal(isWeekend(6), true); assert.equal(isWeekend(7), true); assert.equal(isWeekend(1), false); assert.equal(isWeekend(5), false); });
test("canRent", () => { assert.equal(canRent(21, true), true); assert.equal(canRent(20, true), false); assert.equal(canRent(30, false), false); });
test("מחזירות בוליאני אמיתי", () => assert.equal(typeof isAdult(5), "boolean"));
