import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { pivot } = await load(import.meta.url, "P28.5-E82.ts");

test("הדוגמה", () => {
  const rows = [
    { category: "beans", month: "2026-10", revenue: 120 },
    { category: "beans", month: "2026-09", revenue: 100 },
    { category: "brewing", month: "2026-10", revenue: 50 },
  ];
  assert.deepEqual(pivot(rows, "category", "month", "revenue"), { columns: ["2026-09", "2026-10"], rows: [["beans", 100, 120], ["brewing", null, 50]] });
});
test("סכימה של כפולים, 0 מול null, ריק", () => {
  const rows = [
    { c: "IL", d: "mon", n: 3 }, { c: "US", d: "tue", n: 0 }, { c: "IL", d: "mon", n: 4 }, { c: "DE", d: "wed", n: 1 }, { c: "IL", d: "wed", n: 2 },
  ];
  assert.deepEqual(pivot(rows, "c", "d", "n"), { columns: ["mon", "tue", "wed"], rows: [["IL", 7, null, 2], ["US", null, 0, null], ["DE", null, null, 1]] });
  assert.deepEqual(pivot([], "a", "b", "c"), { columns: [], rows: [] });
});
