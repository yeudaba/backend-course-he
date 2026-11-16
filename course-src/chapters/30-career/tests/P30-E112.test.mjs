import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { weeklyFunnel } = await load(import.meta.url, "P30-E112.ts");
const a = (appliedOn, stage = "applied") => ({ company: "x", appliedOn, stage });

test("קיבוץ לפי שבוע שמתחיל ביום שני", () => {
  const apps = [a("2026-11-02", "screen"), a("2026-11-08"), a("2026-11-01", "interview"), a("2026-11-09", "offer"), a("2026-11-03", "rejected"), a("2026-10-26"), a("2026-11-15", "interview")];
  assert.deepEqual(weeklyFunnel(apps), [
    { week: "2026-10-26", applied: 2, responded: 1, interviews: 1 },
    { week: "2026-11-02", applied: 3, responded: 2, interviews: 0 },
    { week: "2026-11-09", applied: 2, responded: 2, interviews: 2 },
  ]);
});
test("מעבר שנה, ריק, תאריכים לא תקינים", () => {
  assert.deepEqual(weeklyFunnel([a("2027-01-01"), a("2026-12-28")]), [{ week: "2026-12-28", applied: 2, responded: 0, interviews: 0 }]);
  assert.deepEqual(weeklyFunnel([]), []);
  for (const d of ["2026-13-01", "2026-02-30", "02-11-2026", "", "2026-1-5"]) assert.throws(() => weeklyFunnel([a(d)]), RangeError, d);
});
