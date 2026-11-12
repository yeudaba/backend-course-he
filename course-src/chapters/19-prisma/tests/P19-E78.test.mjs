import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E78.ts";
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("סינון, מיון, עמודים ו־total", async (t) => {
  const { listOrders } = await exportsOf(import.meta.url, FILE, ["listOrders"]);
  const { prisma, db } = await shop(t, import.meta.url, { log: true });
  await db.query("INSERT INTO orders (customer_id, status, created_at) VALUES (1, 'paid', '2026-03-28 21:10:00+03'), (2, 'paid', '2026-03-28 21:10:00+03')");
  const ids = async (q) => (await listOrders(prisma, q)).data.map((o) => o.id);
  const first = await listOrders(prisma, {});
  assert.deepEqual(first.meta, { page: 1, limit: 5, total: 14 });
  assert.deepEqual(first.data[0], { id: 12, customerId: 6, status: "pending" });
  assert.deepEqual(await ids({}), [12, 11, 10, 9, 14], "תיקו ב־createdAt (8, 13, 14) — לפי id יורד");
  assert.deepEqual(await ids({ page: 2 }), [13, 8, 7, 6, 5]);
  assert.deepEqual(await ids({ sort: "createdAt", limit: 3 }), [1, 2, 3]);
  assert.deepEqual(await ids({ sort: "createdAt", page: 3, limit: 3 }), [7, 8, 13]);
  const paid = await listOrders(prisma, { status: "paid", limit: 2 });
  assert.deepEqual(paid.meta, { page: 1, limit: 2, total: 5 }, "total עם אותו where");
  assert.deepEqual(paid.data.map((o) => o.id), [10, 14]);
  const dana = await listOrders(prisma, { customerId: 1, status: "shipped", sort: "createdAt" });
  assert.deepEqual(dana.data.map((o) => o.id), [1, 3]);
  assert.equal(dana.meta.total, 2);
  assert.deepEqual((await listOrders(prisma, { customerId: 4 })).meta.total, 0);
});
