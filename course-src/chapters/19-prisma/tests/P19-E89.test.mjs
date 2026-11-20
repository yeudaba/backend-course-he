import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E89: הטבלה products", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E89.prisma");
  assert.deepEqual(await columns(db, "products"), {
    id: "integer NOT NULL DEFAULT autoincrement",
    in_stock: "integer NOT NULL DEFAULT 0",
    is_active: "boolean NOT NULL DEFAULT true",
    name: "text NOT NULL",
    price: "numeric(10,2) NOT NULL",
  });
  const [row] = await db.rows("INSERT INTO products (name, price) VALUES ('Mug', 39.90) RETURNING id, in_stock, is_active");
  assert.deepEqual(row, { id: 1, in_stock: 0, is_active: true });
});
