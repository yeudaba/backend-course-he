import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { estimate } = await load(import.meta.url, "P28-E07.ts");

test("קיצור קישורים: 10 מיליון משתמשים ביום", () => {
  const r = estimate({ dailyActiveUsers: 10_000_000, requestsPerUserPerDay: 10, writeRatio: 0.01, bytesPerWrite: 500, peakFactor: 3, retentionDays: 365 * 5 });
  assert.deepEqual(r, { avgRps: 1157, peakRps: 3472, writesPerSecond: 12, storageGB: 913 });
});
test("חנות קטנה", () => {
  const r = estimate({ dailyActiveUsers: 2000, requestsPerUserPerDay: 30, writeRatio: 0.1, bytesPerWrite: 2000, peakFactor: 5, retentionDays: 365 });
  assert.deepEqual(r, { avgRps: 1, peakRps: 3, writesPerSecond: 0, storageGB: 4 });
});
