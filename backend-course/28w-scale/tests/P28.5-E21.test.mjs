import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { latencyReport } = await load(import.meta.url, "P28.5-E21.ts");

test("באג 1: מיון מספרי", () => {
  assert.deepEqual(latencyReport([[100, 9, 25, 3, 7]]), { count: 5, p50: 9, p99: 100 });
});
test("באג 2: nearest-rank", () => {
  const s = Array.from({ length: 100 }, (_, i) => i + 1);
  assert.deepEqual(latencyReport([s]), { count: 100, p50: 50, p99: 99 });
});
test("באג 3: percentile על כל הדגימות, לא ממוצע של שרתים", () => {
  const fast = Array(990).fill(10);
  const slow = [...Array(5).fill(10), ...Array(5).fill(2000)];
  // שרת אחד עמוס: 1% מכלל הבקשות לוקחות 2 שניות
  assert.deepEqual(latencyReport([fast, slow]), { count: 1000, p50: 10, p99: 10 });
  const slow2 = [...Array(0).fill(10), ...Array(20).fill(2000)];
  assert.equal(latencyReport([fast, slow2]).p99, 2000, "20 מתוך 1010 איטיות — p99 הוא 2000");
});
