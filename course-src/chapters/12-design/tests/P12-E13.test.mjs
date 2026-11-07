import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { Inventory } = await load(import.meta.url, "P12-E13.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E13.ts"); assert.ok(r.ok, r.output); });
test("זרימה מלאה", () => { const i = new Inventory(); i.addStock("A", 5); i.reserve("A", 3); assert.equal(i.available("A"), 2); i.commit("A", 2); assert.equal(i.available("A"), 2); i.release("A", 1); assert.equal(i.available("A"), 3); });
test("שריון יותר מהזמין", () => { const i = new Inventory(); i.addStock("A", 2); i.reserve("A", 2); assert.throws(() => i.reserve("A", 1), { message: "אין מספיק מלאי של A" }); assert.throws(() => i.reserve("Z", 1)); });
test("שחרור/מכירה מעבר לשריון", () => { const i = new Inventory(); i.addStock("A", 5); i.reserve("A", 1); assert.throws(() => i.release("A", 2), { message: "שחרור גדול מהשריון" }); assert.throws(() => i.commit("A", 2), { message: "שחרור גדול מהשריון" }); assert.equal(i.available("A"), 4); });
test("כמויות לא חוקיות", () => { const i = new Inventory(); for (const q of [0, -1, 1.5]) assert.throws(() => i.addStock("A", q), { message: "כמות לא תקינה" }); });
