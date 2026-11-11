import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E57.ts";
async function setup(t) {
  const { exportCsv } = await exportsOf(import.meta.url, FILE, ["exportCsv"]);
  const db = await sandbox(t, import.meta.url, "shop.sql");
  return (text, values) => exportCsv(db.client, text, values);
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("כותרת, null ו־\\r\\n", async (t) => {
  const csv = await setup(t);
  assert.equal(
    await csv("SELECT id, full_name, city FROM customers WHERE id IN (1, 4) ORDER BY id"),
    "id,full_name,city\r\n1,Dana Levi,Tel Aviv\r\n4,Avi Peretz,\r\n",
  );
  assert.equal(await csv("SELECT price::text AS price, is_active FROM products WHERE id = $1", [4]), "price,is_active\r\n79.00,false\r\n");
});
test("מירכאות, פסיקים ושורות חדשות", async (t) => {
  const csv = await setup(t);
  assert.equal(
    await csv(`SELECT 'Moka Pot 6"' AS "name, full", 'a,b' AS b, E'x\\ny' AS c, 'plain' AS d`),
    '"name, full",b,c,d\r\n"Moka Pot 6""","a,b","x\ny",plain\r\n',
  );
});
test("בלי שורות — עדיין כותרת", async (t) => {
  const csv = await setup(t);
  assert.equal(await csv("SELECT id, name FROM products WHERE category = 'tea'"), "id,name\r\n");
});
