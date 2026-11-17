import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E79.ts";
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("ספירה לפי סטטוס, עם אפסים", async (t) => {
  const { orderStats } = await exportsOf(import.meta.url, FILE, ["orderStats"]);
  const { prisma, queries } = await shop(t, import.meta.url, { log: true });
  queries.length = 0;
  assert.deepEqual(await orderStats(prisma), { total: 12, byStatus: { pending: 2, paid: 3, shipped: 6, cancelled: 1 } });
  assert.equal(queries.length, 1, "שאילתה אחת");
  assert.deepEqual(await orderStats(prisma, 1), { total: 3, byStatus: { pending: 0, paid: 1, shipped: 2, cancelled: 0 } });
  assert.deepEqual(await orderStats(prisma, 4), { total: 0, byStatus: { pending: 0, paid: 0, shipped: 0, cancelled: 0 } });
  assert.deepEqual(await orderStats(prisma, 3), { total: 2, byStatus: { pending: 0, paid: 1, shipped: 0, cancelled: 1 } });
});
