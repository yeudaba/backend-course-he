import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E80.ts";
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שלוש התוצאות", async (t) => {
  const { deleteCustomer } = await exportsOf(import.meta.url, FILE, ["deleteCustomer"]);
  const { prisma } = await shop(t, import.meta.url);
  assert.equal(await deleteCustomer(prisma, 8), true, "עומר — בלי הזמנות");
  assert.equal(await prisma.customer.count(), 7);
  assert.equal(await deleteCustomer(prisma, 8), false, "כבר נמחק");
  assert.equal(await deleteCustomer(prisma, 999), false);
  await assert.rejects(deleteCustomer(prisma, 1), (e) => e.code === "HAS_ORDERS", "לדנה יש הזמנות");
  assert.equal(await prisma.customer.count(), 7);
});
