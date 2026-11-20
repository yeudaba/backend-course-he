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
test("גבולות השנה: 1.1 בחצות (UTC) בפנים, 1.1 של השנה הבאה בחוץ", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const before = await monthlyReport(prisma, 2026);
  await prisma.$executeRawUnsafe("INSERT INTO orders (customer_id, status, created_at) VALUES (1, 'paid', '2026-01-01 00:00:00+00'), (1, 'paid', '2027-01-01 00:00:00+00')");
  await prisma.$executeRawUnsafe("INSERT INTO order_items (order_id, product_id, quantity, unit_price) SELECT id, 10, 1, 39 FROM orders WHERE created_at IN ('2026-01-01 00:00:00+00', '2027-01-01 00:00:00+00')");
  const after = await monthlyReport(prisma, 2026);
  assert.equal(after[0].orders, before[0].orders + 1, "הזמנה ב־1.1.2026 00:00 UTC — בינואר");
  assert.equal(after[11].orders, before[11].orders, "הזמנה ב־1.1.2027 — לא בדצמבר 2026");
});
