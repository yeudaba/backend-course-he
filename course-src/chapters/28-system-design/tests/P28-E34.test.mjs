import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { formatBytes } = await load(import.meta.url, "P28-E34.ts");

test("יחידות עשרוניות, ספרה אחת, בלי .0", () => {
  const cases = [[0, "0B"], [999, "999B"], [1000, "1KB"], [1500, "1.5KB"], [2_340_000, "2.3MB"], [913_000_000_000, "913GB"], [18_250_000_000_000, "18.3TB"], [4_000_000_000_000_000, "4PB"], [2.5e18, "2500PB"], [1_049_000, "1MB"]];
  for (const [n, want] of cases) assert.equal(formatBytes(n), want, `formatBytes(${n})`);
});
test("לא תקין ← RangeError", () => {
  assert.throws(() => formatBytes(-5), RangeError);
  assert.throws(() => formatBytes(NaN), RangeError);
  assert.throws(() => formatBytes(Infinity), RangeError);
});
