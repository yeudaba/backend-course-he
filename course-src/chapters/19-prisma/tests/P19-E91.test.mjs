import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E91.ts";
const ids = (r) => r.items.map((o) => o.id);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("עמודים, מהחדשה לישנה", async (t) => {
  const { listOrders } = await exportsOf(import.meta.url, FILE, ["listOrders"]);
  const { prisma } = await shop(t, import.meta.url);
  const p1 = await listOrders(prisma);
  assert.deepEqual(ids(p1), [12, 11, 10, 9, 8], "עמוד 1: חמש ההזמנות החדשות ביותר");
  assert.equal(p1.total, 12);
  assert.deepEqual(p1.items[0], { id: 12, customerId: 6, status: "pending" });
  assert.deepEqual(ids(await listOrders(prisma, { page: 2 })), [7, 6, 5, 4, 3]);
  assert.deepEqual(ids(await listOrders(prisma, { page: 3 })), [2, 1]);
  assert.deepEqual(ids(await listOrders(prisma, { page: 2, pageSize: 4 })), [8, 7, 6, 5]);
});
test("סינון לפי status, ו־total אחרי הסינון", async (t) => {
  const { listOrders } = await exportsOf(import.meta.url, FILE, ["listOrders"]);
  const { prisma } = await shop(t, import.meta.url);
  const shipped = await listOrders(prisma, { status: "shipped" });
  assert.deepEqual(ids(shipped), [9, 7, 5, 3, 2]);
  assert.equal(shipped.total, 6, "total צריך לספור רק את ההזמנות שעברו את הסינון");
  const paid = await listOrders(prisma, { status: "paid", page: 2, pageSize: 2 });
  assert.deepEqual(ids(paid), [6]);
  assert.equal(paid.total, 3);
});
test("תיקו בזמן — id גבוה קודם", async (t) => {
  const { listOrders } = await exportsOf(import.meta.url, FILE, ["listOrders"]);
  const { prisma, db } = await shop(t, import.meta.url);
  await db.query("INSERT INTO orders (customer_id, status, created_at) VALUES (1, 'paid', '2026-06-01 10:00:00+03'), (2, 'paid', '2026-06-01 10:00:00+03')");
  assert.deepEqual(ids(await listOrders(prisma, { pageSize: 3 })), [14, 13, 12]);
  await db.query("INSERT INTO orders (customer_id, status, created_at) VALUES (3, 'paid', '2026-06-01 10:00:00+03'), (4, 'paid', '2026-06-01 10:00:00+03')");
  await db.query("UPDATE orders SET status = status WHERE id IN (13, 14)"); // סדר פיזי אחר
  const all = [...ids(await listOrders(prisma, { pageSize: 2 })), ...ids(await listOrders(prisma, { pageSize: 2, page: 2 })), ...ids(await listOrders(prisma, { pageSize: 2, page: 3 }))];
  assert.deepEqual(all, [16, 15, 14, 13, 12, 11], "בתיקו ב־createdAt — orderBy משני לפי id (אחרת הזמנות קופצות בין עמודים)");
});
