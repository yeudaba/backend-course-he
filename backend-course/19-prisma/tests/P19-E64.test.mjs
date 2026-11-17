import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E64.ts";
const get = () => exportsOf(import.meta.url, FILE, ["CustomerInput", "createCustomer"]);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("CustomerInput", async () => {
  const { CustomerInput } = await get();
  assert.deepEqual(CustomerInput.parse({ fullName: "  Lior ", email: "Lior@Example.com", joinedOn: "2026-02-28", isVip: true, id: 99 }), { fullName: "Lior", email: "lior@example.com", city: null, joinedOn: "2026-02-28" });
  assert.deepEqual(CustomerInput.parse({ fullName: "a", email: "a@b.co", city: " Haifa ", joinedOn: "2026-01-01" }).city, "Haifa");
  assert.equal(CustomerInput.parse({ fullName: "a", email: "a@b.co", city: null, joinedOn: "2026-01-01" }).city, null);
  for (const bad of [{}, { fullName: " ", email: "a@b.co", joinedOn: "2026-01-01" }, { fullName: "a", email: "nope", joinedOn: "2026-01-01" }, { fullName: "a", email: "a@b.co", joinedOn: "2026-02-30" }, { fullName: "a", email: "a@b.co", city: "", joinedOn: "2026-01-01" }]) {
    assert.equal(CustomerInput.safeParse(bad).success, false, JSON.stringify(bad));
  }
});
test("createCustomer", async (t) => {
  const { createCustomer } = await get();
  const { prisma } = await shop(t, import.meta.url);
  assert.deepEqual(await createCustomer(prisma, { fullName: " Tal Gil ", email: "TAL@x.com", joinedOn: "2026-05-10", isVip: true }), { id: 9, fullName: "Tal Gil", email: "tal@x.com", city: null, joinedOn: "2026-05-10" });
  const row = await prisma.customer.findUniqueOrThrow({ where: { id: 9 } });
  assert.equal(row.joinedOn.toISOString(), "2026-05-10T00:00:00.000Z");
  await assert.rejects(createCustomer(prisma, { fullName: "", email: "x@x.com", joinedOn: "2026-01-01" }), (e) => e.name === "ZodError", "ZodError");
  assert.equal(await prisma.customer.count(), 9, "קלט לא תקין — בלי create");
});
