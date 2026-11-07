import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { ShoppingCart } = await load(import.meta.url, "P12-E08.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E08.ts"); assert.ok(r.ok, r.output); });
test("add, total, itemCount", () => { const c = new ShoppingCart(); c.add("A", 2.5, 2); c.add("A", 2.5); c.add("B", 10); assert.equal(c.total, 17.5); assert.equal(c.itemCount, 4); });
test("remove", () => { const c = new ShoppingCart(); c.add("A", 1); assert.equal(c.remove("A"), true); assert.equal(c.remove("A"), false); assert.equal(c.total, 0); });
test("ערכים לא חוקיים", () => { const c = new ShoppingCart(); assert.throws(() => c.add("A", 0), { message: "כמות ומחיר חייבים להיות חיוביים" }); assert.throws(() => c.add("A", 5, -1)); });
test("items מחזיר עותקים", () => { const c = new ShoppingCart(); c.add("A", 1, 1); c.items()[0].qty = 999; assert.equal(c.itemCount, 1); });
