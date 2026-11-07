import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { cheapestThree, firstListed } = await load(import.meta.url, "P06-E22.js");

test("שלושת הזולים, ממוינים מספרית", () => assert.deepEqual(cheapestThree([120, 15, 9, 300, 45]), [9, 15, 45]));
test("המחירון לא משתנה", () => { const c = [120, 15, 9, 300, 45]; cheapestThree(c); assert.deepEqual(c, [120, 15, 9, 300, 45]); assert.equal(firstListed(c), 120); });
