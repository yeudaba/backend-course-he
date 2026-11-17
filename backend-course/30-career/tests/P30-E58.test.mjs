import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { dateRange } = await load(import.meta.url, "P30-E58.ts");

test("פורמטים", () => {
  assert.equal(dateRange("2024-03"), "Mar 2024 – Present");
  assert.equal(dateRange("2024-03", "2025-01"), "Mar 2024 – Jan 2025");
  assert.equal(dateRange("2024-03", "2024-07"), "Mar – Jul 2024");
  assert.equal(dateRange("2024-12", "2024-12"), "Dec 2024");
  assert.equal(dateRange("2019-01", "2026-12"), "Jan 2019 – Dec 2026");
});
test("שגיאות", () => {
  for (const s of ["2024-3", "2024-13", "2024-00", "24-03", "2024/03", "", "2024-03-01"]) assert.throws(() => dateRange(s), RangeError, s);
  assert.throws(() => dateRange("2024-05", "2024-04"), RangeError);
  assert.throws(() => dateRange("2024-05", "2023-12"), RangeError);
  assert.throws(() => dateRange("2024-05", "2024-5"), RangeError);
});
