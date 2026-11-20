import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E90: העמודות", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E90.prisma");
  assert.deepEqual(await columns(db, "orders"), {
    customer_id: "integer NOT NULL",
    id: "integer NOT NULL DEFAULT autoincrement",
    notes: "text",
    total: "numeric(10,2) NOT NULL",
  }, "notes לא חובה — String?");
});
test("P19-E90: אימייל ייחודי, ולקוח עם הזמנות לא נמחק", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E90.prisma");
  await db.query("INSERT INTO customers (email) VALUES ('a@x.com'), ('b@x.com')");
  await assert.rejects(db.query("INSERT INTO customers (email) VALUES ('a@x.com')"), undefined, "אותו אימייל פעמיים — צריך @unique");
  await db.query("INSERT INTO orders (customer_id, total) VALUES (1, 50), (1, 20)");
  await assert.rejects(db.query("DELETE FROM customers WHERE id = 1"), undefined, "מחיקת לקוח עם הזמנות צריכה להיחסם — לא Cascade");
  assert.equal((await db.rows("SELECT COUNT(*)::int AS n FROM orders"))[0].n, 2);
  await db.query("DELETE FROM customers WHERE id = 2");
});
test("P19-E90: index על customer_id", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E90.prisma");
  const idx = await db.rows("SELECT indexdef FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'orders' AND indexdef LIKE '%(customer_id)%'");
  assert.equal(idx.length, 1, "index על customer_id — @@index([customerId])");
});
