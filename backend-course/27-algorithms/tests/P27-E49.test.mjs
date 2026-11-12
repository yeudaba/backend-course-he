import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { longestUnique } = await load(import.meta.url, "P27-E49.ts");

test("דוגמאות ומקרי קצה", () => {
  assert.deepEqual(longestUnique([..."abcabde"]), { length: 5, start: 2 });
  assert.deepEqual(longestUnique([..."abba"]), { length: 2, start: 0 }, "a שראינו לפני החלון לא מחזיר את left אחורה");
  assert.deepEqual(longestUnique([..."aaaa"]), { length: 1, start: 0 });
  assert.deepEqual(longestUnique([..."abcd"]), { length: 4, start: 0 });
  assert.deepEqual(longestUnique([1, 2, 1, 3, 4, 3]), { length: 4, start: 1 });
  assert.deepEqual(longestUnique([1, 2, 1, 2]), { length: 2, start: 0 }, "בשוויון — המוקדם");
  assert.deepEqual(longestUnique([]), { length: 0, start: 0 });
});
test("300,000 — מהר", () => {
  const items = Array.from({ length: 300_000 }, (_, i) => i % 5000);
  assert.deepEqual(fastEnough(() => longestUnique(items), 200, "longestUnique"), { length: 5000, start: 0 });
});
