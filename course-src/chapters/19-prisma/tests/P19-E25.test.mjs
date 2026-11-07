import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { monthlyReport } = await load(import.meta.url, "P19-E25.ts");

test("דוח חודשי", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const r = await monthlyReport(prisma, 2026);
  assert.equal(r.length, 12);
  assert.deepEqual(r[0], { month: "2026-01", orders: 2, revenue: 473.4, runningTotal: 473.4 });
  assert.deepEqual(r[2], { month: "2026-03", orders: 3, revenue: 617.2, runningTotal: 1576.3 });
  assert.deepEqual(r[4], { month: "2026-05", orders: 2, revenue: 574.7, runningTotal: 2573.8 });
  assert.deepEqual(r[5], { month: "2026-06", orders: 0, revenue: 0, runningTotal: 2573.8 });
  assert.equal(r[11].month, "2026-12");
  assert.deepEqual((await monthlyReport(prisma, 2025)).map((m) => m.orders), Array(12).fill(0));
});
