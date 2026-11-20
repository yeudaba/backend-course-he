import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P28-E101.ts", ["estimate"])).estimate;

test("מיליון משתמשים × 20 פעולות", async () => {
  const f = await get();
  assert.deepEqual(f({ dau: 1_000_000, actionsPerUser: 20, peakFactor: 3, bytesPerAction: 500, retentionDays: 365 }), { avgRps: 231.5, peakRps: 694.4, storageGB: 3650 });
});
test("ערכים אחרים", async () => {
  const f = await get();
  assert.deepEqual(f({ dau: 50_000, actionsPerUser: 4, peakFactor: 5, bytesPerAction: 2000, retentionDays: 30 }), { avgRps: 2.3, peakRps: 11.6, storageGB: 12 });
  assert.deepEqual(f({ dau: 2_000, actionsPerUser: 1, peakFactor: 10, bytesPerAction: 100, retentionDays: 1 }), { avgRps: 0, peakRps: 0.2, storageGB: 0 }, "מעגלים בסוף — לא לפני ההכפלה בשיא");
});
