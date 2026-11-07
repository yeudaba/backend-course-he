import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("קנייה אטומית", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  assert.deepEqual(await db.fileRows("P18-E09.sql"), [{ product_id: 2, stock: 37 }]);
  await db.query("UPDATE inventory SET stock = 3 WHERE product_id = 2");
  assert.deepEqual(await db.fileRows("P18-E09.sql"), [{ product_id: 2, stock: 0 }], "בדיוק 3 — מותר");
  assert.deepEqual(await db.fileRows("P18-E09.sql"), [], "אין מספיק ← אפס שורות");
  assert.equal((await db.rows("SELECT stock FROM inventory WHERE product_id = 2"))[0].stock, 0);
  assert.equal((await db.rows("SELECT stock FROM inventory WHERE product_id = 1"))[0].stock, 1, "מוצרים אחרים לא השתנו");
});
