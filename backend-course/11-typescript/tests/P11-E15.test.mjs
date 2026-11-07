import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { allowedNext, canTransition, transition } = await load(import.meta.url, "P11-E15.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E15.ts"); assert.ok(r.ok, r.output); });
test("allowedNext", () => { assert.deepEqual(allowedNext("pending"), ["paid", "cancelled"]); assert.deepEqual(allowedNext("delivered"), []); assert.deepEqual(allowedNext("shipped"), ["delivered"]); });
test("canTransition", () => { assert.equal(canTransition("paid", "cancelled"), true); assert.equal(canTransition("shipped", "cancelled"), false); });
test("transition", () => {
  assert.deepEqual(transition({ id: 1, status: "pending" }, "paid"), { id: 1, status: "paid" });
  assert.throws(() => transition({ id: 1, status: "delivered" }, "paid"), { message: "לא ניתן לעבור מ־delivered ל־paid" });
});
