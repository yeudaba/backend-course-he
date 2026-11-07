import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { listOrders } = await load(import.meta.url, "P19-E17.ts");

test("cursor", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const a = await listOrders(prisma, { limit: 5 });
  assert.deepEqual(a.data.map((o) => o.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(a.data[0], { id: 1, status: "shipped" });
  assert.equal(a.nextCursor, 5);
  const b = await listOrders(prisma, { after: 5, limit: 5 });
  assert.deepEqual(b.data.map((o) => o.id), [6, 7, 8, 9, 10]);
  const c = await listOrders(prisma, { after: 10, limit: 5 });
  assert.deepEqual(c, { data: [{ id: 11, status: "pending" }, { id: 12, status: "pending" }], nextCursor: null });
  assert.equal((await listOrders(prisma, { after: 7, limit: 5 })).nextCursor, null, "בדיוק 5 נשארו");
  assert.equal((await listOrders(prisma)).data.length, 5);
});
