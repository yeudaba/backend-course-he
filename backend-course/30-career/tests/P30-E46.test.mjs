import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { historyStats } = await load(import.meta.url, "P30-E46.ts");

test("סטטיסטיקה של לוג", () => {
  const log = [
    "a1b2c3d|2026-11-10|Add Redis cache for product list",
    "b2c3d4e|2026-11-10|wip",
    "",
    "c3d4e5f|2026-11-03|Support a|b filters in GET /orders",
    "d4e5f6a|2026-11-02|Fix",
    "e5f6a7b|2026-10-20|stuff",
    "f6a7b8c|2026-10-20|  Update  ",
    "a7b8c9d|2026-10-19|Refactor",
    "b8c9d0e|2026-10-19|Initial commit",
  ].join("\n");
  assert.deepEqual(historyStats(log), { commits: 8, activeDays: 5, longestGapDays: 13, vague: ["b2c3d4e", "d4e5f6a", "e5f6a7b", "f6a7b8c", "a7b8c9d"] });
});
test("קצוות", () => {
  assert.deepEqual(historyStats(""), { commits: 0, activeDays: 0, longestGapDays: 0, vague: [] });
  assert.deepEqual(historyStats("x|2026-01-01|Add login endpoint\ny|2026-01-01|Add logout endpoint"), { commits: 2, activeDays: 1, longestGapDays: 0, vague: [] });
  assert.equal(historyStats("x|2026-02-27|Add a b\ny|2026-03-01|Add c d").longestGapDays, 2, "פברואר 2026 — 28 ימים");
  assert.throws(() => historyStats("abc|2026-01-01"), Error);
  assert.throws(() => historyStats("just a line"), Error);
});
