import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { freshness } = await load(import.meta.url, "P28.5-E93.ts");
const NOW = Date.parse("2026-10-01T12:00:00Z");
const M = 60_000;

test("סטטוסים", () => {
  assert.deepEqual(freshness("2026-10-01T11:59:15Z", NOW, 15 * M), { status: "fresh", lagMs: 45_000, label: "45s" });
  assert.deepEqual(freshness("2026-10-01T11:37:30Z", NOW, 15 * M), { status: "fresh", lagMs: 22.5 * M, label: "22m 30s" });
  assert.deepEqual(freshness("2026-10-01T11:37:29Z", NOW, 15 * M), { status: "late", lagMs: 22.5 * M + 1000, label: "22m 31s" });
  assert.deepEqual(freshness("2026-10-01T11:00:00Z", NOW, 15 * M), { status: "late", lagMs: 60 * M, label: "1h 0m" });
  assert.deepEqual(freshness("2026-10-01T08:57:59.900Z", NOW, 15 * M), { status: "broken", lagMs: 3 * 60 * M + 2 * M + 100, label: "3h 2m" });
  assert.deepEqual(freshness(null, NOW, 15 * M), { status: "broken", lagMs: null, label: "never" });
});
test("label", () => {
  assert.equal(freshness("2026-10-01T12:00:00Z", NOW, M).label, "0s");
  assert.equal(freshness("2026-10-01T11:59:00.500Z", NOW, M).label, "59s");
  assert.equal(freshness("2026-09-30T10:30:00Z", NOW, M).label, "25h 30m");
});
