import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { cartTotal, removeItem } = await load(import.meta.url, "P06-E23.js");

test("cartTotal", () => { assert.equal(cartTotal([10, 20]), 30); assert.equal(cartTotal([]), 0); });
test("removeItem מחזירה עגלה בלי הפריט", () => assert.deepEqual(removeItem(["עט", "מחברת", "תיק"], 1), ["עט", "תיק"]));
test("removeItem לא משנה את המקור", () => { const c = ["a", "b"]; removeItem(c, 0); assert.deepEqual(c, ["a", "b"]); });
