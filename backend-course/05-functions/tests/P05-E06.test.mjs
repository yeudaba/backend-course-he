import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toCelsius } = await load(import.meta.url, "P05-E06.js");

test("212°F הם 100°C", () => assert.equal(toCelsius(212), 100));
test("32°F הם 0°C", () => assert.equal(toCelsius(32), 0));
test("‎-40 הוא אותו ערך בשתי הסקאלות", () => assert.equal(toCelsius(-40), -40));
test("מחזירה מספר ולא מחרוזת", () => assert.equal(typeof toCelsius(50), "number"));
