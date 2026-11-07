import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { ordersWithCustomers } = await load(import.meta.url, "P19-E20.ts");

test("בלי N+1", async (t) => {
  const { prisma, queries } = await shop(t, import.meta.url, { log: true });
  const before = queries.length;
  const r = await ordersWithCustomers(prisma);
  assert.ok(queries.length - before <= 2, `${queries.length - before} שאילתות — מותר עד 2`);
  assert.equal(r.length, 12);
  assert.deepEqual(r[0], { id: 1, status: "shipped", customer: "Dana Levi" });
  assert.deepEqual(r[11], { id: 12, status: "pending", customer: "Ron Avraham" });
});
