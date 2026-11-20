import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { trafficFromLogs } = await load(import.meta.url, "P28-E44.ts");
const at = (iso) => JSON.stringify({ level: "info", time: iso, method: "GET", path: "/" });

test("דקות שקטות נספרות, סדר לא חשוב", () => {
  const lines = [
    at("2026-03-01T10:04:30Z"),
    at("2026-03-01T10:00:01Z"),
    "not json",
    at("2026-03-01T10:00:59Z"),
    JSON.stringify({ msg: "no time" }),
    at("2026-03-01T10:04:00Z"),
    at("2026-03-01T10:04:59Z"),
    at("2026-03-01T10:02:10Z"),
    JSON.stringify({ time: "yesterday" }),
  ];
  assert.deepEqual(trafficFromLogs(lines), { total: 6, skipped: 3, minutes: 5, avgPerMinute: 1.2, peakPerMinute: 3, peakFactor: 2.5 });
});
test("דקה אחת", () => {
  assert.deepEqual(trafficFromLogs([at("2026-03-01T10:00:00Z"), at("2026-03-01T10:00:30Z")]), { total: 2, skipped: 0, minutes: 1, avgPerMinute: 2, peakPerMinute: 2, peakFactor: 1 });
});
test("אין בקשות תקינות", () => {
  assert.deepEqual(trafficFromLogs(["{", "null", "5"]), { total: 0, skipped: 3, minutes: 0, avgPerMinute: 0, peakPerMinute: 0, peakFactor: 0 });
  assert.deepEqual(trafficFromLogs([]), { total: 0, skipped: 0, minutes: 0, avgPerMinute: 0, peakPerMinute: 0, peakFactor: 0 });
});
test("peakFactor מעוגל לספרה אחת", () => {
  const lines = ["10:00:01", "10:00:02", "10:00:03", "10:01:00", "10:02:00", "10:02:01", "10:02:02"].map((t) => at(`2026-03-01T${t}Z`));
  const r = trafficFromLogs(lines);
  assert.equal(r.avgPerMinute, 2.3);
  assert.equal(r.peakFactor, 1.3, "3 / 2.333 = 1.2857 ← 1.3");
});
