import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("מחיקה מדויקת", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  assert.deepEqual(await db.fileRows("P16-E18.sql"), [{ full_name: "Yossi Cohen" }]);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM customers"))[0].n, 11);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM customers WHERE phone IS NULL"))[0].n, 3, "שאר הלקוחות בלי טלפון — נשארים");
});
