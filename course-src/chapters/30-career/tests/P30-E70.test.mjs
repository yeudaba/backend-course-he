import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { speakingTime } = await load(import.meta.url, "P30-E70.ts");
const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");

test("מילים, שניות, הערכה", () => {
  assert.deepEqual(speakingTime("API לחנות — ציוד קפה, 22 endpoints."), { words: 6, seconds: 3, verdict: "short" });
  assert.deepEqual(speakingTime(words(260)), { words: 260, seconds: 120, verdict: "ok" });
  assert.deepEqual(speakingTime(words(195)), { words: 195, seconds: 90, verdict: "ok" });
  assert.deepEqual(speakingTime(words(194)), { words: 194, seconds: 90, verdict: "ok" }, "89.5 מעוגל ל־90");
  assert.deepEqual(speakingTime(words(192)), { words: 192, seconds: 89, verdict: "short" });
  assert.deepEqual(speakingTime(words(326)), { words: 326, seconds: 150, verdict: "ok" });
  assert.deepEqual(speakingTime(words(328)), { words: 328, seconds: 151, verdict: "long" });
  assert.deepEqual(speakingTime("  \n — – ... "), { words: 0, seconds: 0, verdict: "short" });
  assert.deepEqual(speakingTime(words(100), 100), { words: 100, seconds: 60, verdict: "short" });
});
test("wpm לא תקין", () => {
  for (const w of [0, -5, NaN]) assert.throws(() => speakingTime("x", w), RangeError);
});
