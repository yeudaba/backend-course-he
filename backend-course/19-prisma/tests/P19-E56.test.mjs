import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E56: invoices", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E56.prisma");
  assert.deepEqual(await columns(db, "invoices"), {
    created_at: "timestamp with time zone NOT NULL DEFAULT now",
    id: "integer NOT NULL DEFAULT autoincrement",
    issued_on: "date NOT NULL",
    note: "text",
    number: "text NOT NULL",
    total: "numeric(12,2) NOT NULL",
    updated_at: "timestamp with time zone NOT NULL",
  }, "updated_at — בלי DEFAULT במסד (‏@updatedAt ממלא אותו מ־Prisma)");
  await db.query("INSERT INTO invoices (number, issued_on, total, updated_at) VALUES ('A-1', '2026-03-01', 10, now())");
  await assert.rejects(db.query("INSERT INTO invoices (number, issued_on, total, updated_at) VALUES ('A-1', '2026-03-02', 5, now())"), undefined, "number ייחודי");
});
