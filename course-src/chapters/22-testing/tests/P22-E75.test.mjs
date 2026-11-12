import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P22-E75.ts", ["uncoveredLines", "linePercent"]);
const LCOV = `TN:
SF:src/pricing.ts
FN:1,price
FNDA:4,price
DA:1,4
DA:2,4
DA:10,0
DA:9,0,abc123
DA:3,1
LF:5
LH:3
end_of_record
TN:
SF:src/money.ts
DA:1,7
DA:2,7
end_of_record
SF:src/tasks/tasks.service.ts
DA:5,0
DA:6,2
end_of_record
`;

test("uncoveredLines", async () => {
  const { uncoveredLines } = await get();
  assert.deepEqual(uncoveredLines(LCOV), { "src/pricing.ts": [9, 10], "src/tasks/tasks.service.ts": [5] });
  assert.deepEqual(uncoveredLines(""), {});
  assert.deepEqual(uncoveredLines("SF:a.ts\r\nDA:2,0\r\nDA:11,0\r\nDA:3,0\r\nend_of_record\r\n"), { "a.ts": [2, 3, 11] }, "מיון מספרי, ו־\\r\\n");
});
test("linePercent", async () => {
  const { linePercent } = await get();
  assert.equal(linePercent(LCOV), 66.7, "6 מתוך 9");
  assert.equal(linePercent("SF:a.ts\nDA:1,1\nDA:2,1\nDA:3,0\nend_of_record"), 66.7);
  assert.equal(linePercent("SF:a.ts\nDA:1,1\nend_of_record"), 100);
  assert.equal(linePercent("SF:a.ts\nDA:1,0\nend_of_record"), 0);
  assert.equal(linePercent(""), 100);
  assert.equal(linePercent("SF:a.ts\nDA:1,1\nDA:2,0\nDA:3,0\nDA:4,0\nDA:5,0\nDA:6,0\nDA:7,0\nend_of_record"), 14.3);
});
