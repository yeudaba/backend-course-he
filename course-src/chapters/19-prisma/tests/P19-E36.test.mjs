import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E36: הטבלה suppliers", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E36.prisma");
  assert.deepEqual(await columns(db, "suppliers"), {
    email: "text NOT NULL",
    id: "integer NOT NULL DEFAULT autoincrement",
    is_active: "boolean NOT NULL DEFAULT true",
    name: "text NOT NULL",
  });
  const [row] = await db.rows("INSERT INTO suppliers (name, email) VALUES ('Beans Ltd', 'b@x.com') RETURNING id, is_active");
  assert.deepEqual(row, { id: 1, is_active: true });
  await assert.rejects(db.query("INSERT INTO suppliers (id, name, email) VALUES (1, 'x', 'y')"), undefined, "id הוא מפתח ראשי");
});
