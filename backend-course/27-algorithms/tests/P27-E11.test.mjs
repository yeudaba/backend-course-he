import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { peakInWindow } = await load(import.meta.url, "P27-E11.ts");

test("השיא בחלון של windowMs (חלון [start, start + windowMs))", () => {
  assert.deepEqual(peakInWindow([0, 100, 900, 1000, 1100, 1150, 3000], 1000), { count: 4, start: 900 });
  assert.deepEqual(peakInWindow([0, 999, 1000], 1000), { count: 2, start: 0 }, "999 בפנים; 1000 כבר בחלון הבא");
  assert.deepEqual(peakInWindow([5, 5, 5], 1), { count: 3, start: 5 });
});
test("בתיקו — החלון הראשון; ריק — 0", () => {
  assert.deepEqual(peakInWindow([0, 10, 5000, 5010], 100), { count: 2, start: 0 });
  assert.deepEqual(peakInWindow([], 1000), { count: 0, start: 0 });
});
test("200,000 בקשות — מהר (O(n))", () => {
  const ts = Array.from({ length: 200_000 }, (_, i) => i * 10);
  const r = fastEnough(() => peakInWindow(ts, 60_000), 300, "peakInWindow על 200,000 חותמות זמן עם חלון של דקה");
  assert.deepEqual(r, { count: 6000, start: 0 });
});
