import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E82.ts";
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("חיפוש בשם, באימייל ובעיר", async (t) => {
  const { searchCustomers } = await exportsOf(import.meta.url, FILE, ["searchCustomers"]);
  const { prisma, db, queries } = await shop(t, import.meta.url, { log: true });
  await db.query("INSERT INTO customers (full_name, email, city, joined_on) VALUES ('Avi Peretz', 'avi2@haifa.net', NULL, '2026-05-01')");
  assert.deepEqual(await searchCustomers(prisma, "haifa"), [{ id: 9, fullName: "Avi Peretz" }, { id: 7, fullName: "Shira David" }, { id: 2, fullName: "Yossi Cohen" }], "עיר או אימייל, בלי הבדל אותיות; תיקו בשם — לפי id");
  assert.deepEqual(await searchCustomers(prisma, "  LEVI "), [{ id: 1, fullName: "Dana Levi" }]);
  assert.deepEqual(await searchCustomers(prisma, "ron@"), [{ id: 6, fullName: "Ron Avraham" }]);
  assert.deepEqual(await searchCustomers(prisma, "zzz"), []);
  queries.length = 0;
  assert.deepEqual(await searchCustomers(prisma, "   "), []);
  assert.equal(queries.length, 0, "q ריק — בלי שאילתה");
});
