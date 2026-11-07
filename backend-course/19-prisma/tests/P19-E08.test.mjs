import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { createCustomer } = await load(import.meta.url, "P19-E08.ts");

test("לקוח חדש", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const c = await createCustomer(prisma, { fullName: "Lior Katz", email: "lior@example.com", city: "Ramat Gan" });
  assert.equal(c.id, 9);
  assert.equal(c.fullName, "Lior Katz");
  assert.equal(c.joinedOn.toISOString().slice(0, 10), new Date().toISOString().slice(0, 10));
  assert.equal((await createCustomer(prisma, { fullName: "X", email: "x@example.com" })).city, null);
  await assert.rejects(createCustomer(prisma, { fullName: "Dana 2", email: "dana@example.com" }), (e) => e.code === "EMAIL_TAKEN");
  assert.equal(await prisma.customer.count(), 10);
});
