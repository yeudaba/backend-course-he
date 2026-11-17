import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E46.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["parseCsv"])).parseCsv;
const types = { price: "numeric", stock: "integer", is_active: "boolean", added_on: "date" };
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("המרה לפי טיפוס, ריק ← null", async () => {
  const f = await get();
  const csv = "name,price,stock,is_active,added_on\r\nHand Grinder,189.00,8,true,2026-02-14\r\n\r\nMoka Pot , 149, ,false,\r\n Pen ,4.5,-2,true,2026-01-01\r\n";
  assert.deepEqual(f(csv, types), [
    { name: "Hand Grinder", price: 189, stock: 8, is_active: true, added_on: "2026-02-14" },
    { name: "Moka Pot", price: 149, stock: null, is_active: false, added_on: null },
    { name: "Pen", price: 4.5, stock: -2, is_active: true, added_on: "2026-01-01" },
  ]);
  assert.deepEqual(f("a,b\n1,2\n", {}), [{ a: "1", b: "2" }], "בלי טיפוס ← text");
  assert.deepEqual(f("a,b\n", {}), []);
  assert.deepEqual(f("", {}), []);
});
test("שגיאות עם מספר השורה בקובץ", async () => {
  const f = await get();
  assert.throws(() => f("name,stock\nPen,3\n\nCup,2.5\n", { stock: "integer" }), { message: 'line 4: invalid integer for stock: "2.5"' });
  assert.throws(() => f("name,price\nPen,abc\n", { price: "numeric" }), { message: 'line 2: invalid numeric for price: "abc"' });
  assert.throws(() => f("a,flag\nx,yes\n", { flag: "boolean" }), { message: 'line 2: invalid boolean for flag: "yes"' });
  assert.throws(() => f("a,d\nx,1.2.2026\n", { d: "date" }), { message: 'line 2: invalid date for d: "1.2.2026"' });
  assert.throws(() => f("a,b,c\n1,2,3\n1,2\n", {}), { message: "line 3: expected 3 values, got 2" });
  assert.throws(() => f("a,stock\nx, 1e3\n", { stock: "integer" }), { message: 'line 2: invalid integer for stock: "1e3"' });
});
