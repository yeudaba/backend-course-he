import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E37: coupons ו־gift_cards", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E37.prisma");
  assert.deepEqual(await columns(db, "coupons"), {
    code: "text NOT NULL",
    id: "integer NOT NULL DEFAULT autoincrement",
    is_active: "boolean NOT NULL DEFAULT true",
    max_uses: "integer NOT NULL DEFAULT 1",
    percent: "numeric(5,2) NOT NULL",
  });
  assert.deepEqual(await columns(db, "gift_cards"), {
    amount: "numeric(10,2) NOT NULL",
    holder_name: "text NOT NULL",
    id: "integer NOT NULL DEFAULT autoincrement",
  });
  await assert.rejects(db.query("INSERT INTO coupons (code, percent) VALUES ('BIG', 1000)"), undefined, "percent עם 5 ספרות — 1000.00 לא נכנס");
});
