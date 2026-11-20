import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { revenueByCategory } = await load(import.meta.url, "P19-E13.ts");

test("הכנסות לפי קטגוריה", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  assert.deepEqual(await revenueByCategory(prisma, { since: new Date("2020-01-01") }), [
    { category: "beans", revenue: 1058.2 }, { category: "brewing", revenue: 765 }, { category: "grinders", revenue: 378 }, { category: "accessories", revenue: 372.6 },
  ]);
  const april = await revenueByCategory(prisma, { since: new Date("2026-04-01T00:00:00Z") });
  assert.deepEqual(april.map((r) => [r.category, r.revenue]), [["beans", 359.6], ["brewing", 268], ["grinders", 189], ["accessories", 180.9]]);
  assert.equal(april.find((r) => r.category === "beans").revenue, 359.6);
  assert.deepEqual(await revenueByCategory(prisma, { since: new Date("2030-01-01") }), []);
});
test("since כולל את הרגע עצמו", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const [{ created_at }] = await prisma.$queryRawUnsafe("SELECT created_at FROM orders WHERE id = 9");
  const at = await revenueByCategory(prisma, { since: created_at });
  const after = await revenueByCategory(prisma, { since: new Date(created_at.getTime() + 1000) });
  assert.ok(at.reduce((s, r) => s + r.revenue, 0) > after.reduce((s, r) => s + r.revenue, 0), "הזמנה שנוצרה בדיוק ב־since — נכללת (>=)");
});
