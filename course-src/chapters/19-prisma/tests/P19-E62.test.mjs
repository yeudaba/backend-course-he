import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P19-E62.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["diffColumns"])).diffColumns;
const col = (table, name, type, nullable = false) => ({ table, name, type, nullable });

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הוספות בלבד — לא הורס", async () => {
  const diff = await get();
  const before = [col("customers", "id", "integer"), col("customers", "email", "text")];
  const after = [col("customers", "id", "integer"), col("customers", "email", "text"), col("customers", "is_vip", "boolean"), col("customers", "city", "text", true), col("reviews", "id", "integer")];
  assert.deepEqual(diff(before, after), { steps: ["ADD COLUMN customers.city text", "ADD COLUMN customers.is_vip boolean NOT NULL", "CREATE TABLE reviews"], destructive: false });
  assert.deepEqual(diff(before, before), { steps: [], destructive: false });
  assert.deepEqual(diff([], []), { steps: [], destructive: false });
});
test("שינויים הורסים, וסדר", async () => {
  const diff = await get();
  const before = [col("orders", "status", "text"), col("orders", "note", "text"), col("legacy", "x", "text"), col("orders", "total", "integer", true), col("accounts", "name", "text"), col("orders", "coupon", "text")];
  const after = [col("orders", "status", "text", true), col("orders", "total", "numeric(10,2)", false), col("accounts", "name", "text"), col("orders", "coupon", "varchar(20)", true)];
  assert.deepEqual(diff(before, after), {
    steps: [
      "DROP TABLE legacy",
      "ALTER COLUMN orders.coupon TYPE varchar(20)",
      "ALTER COLUMN orders.coupon DROP NOT NULL",
      "DROP COLUMN orders.note",
      "ALTER COLUMN orders.status DROP NOT NULL",
      "ALTER COLUMN orders.total TYPE numeric(10,2)",
      "ALTER COLUMN orders.total SET NOT NULL",
    ],
    destructive: true,
  });
  assert.equal(diff([col("a", "x", "text", true)], [col("a", "x", "text", false)]).destructive, true, "SET NOT NULL — הורס");
  assert.equal(diff([col("a", "x", "text", false)], [col("a", "x", "text", true)]).destructive, false, "DROP NOT NULL — לא הורס");
});
