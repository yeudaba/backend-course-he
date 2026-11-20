import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E95.js";
const get = () => exportsOf(import.meta.url, FILE, ["parseDuration"]);

test("משכי זמן תקינים ← שניות", async () => {
  const { parseDuration } = await get();
  const cases = [
    ["1h 30m", 5400],
    ["1h30m", 5400],
    ["45m", 2700],
    ["2h", 7200],
    ["90s", 90],
    ["1h 1m 1s", 3661],
    ["1h30m15s", 5415],
    ["2h 5s", 7205],
    ["0s", 0],
    ["  10m  ", 600],
    ["100m", 6000],
  ];
  for (const [text, seconds] of cases) {
    assert.equal(parseDuration(text), seconds, `parseDuration("${text}")`);
  }
});
test("קלט לא תקין ← null", async () => {
  const { parseDuration } = await get();
  for (const text of ["", "   ", "h", "30", "1 h", "1.5h", "30m 1h", "1h 1h", "1d", "1h30", "-5m", "1H", "abc 1h"]) {
    assert.equal(parseDuration(text), null, `parseDuration("${text}") צריך להיות null`);
  }
});
