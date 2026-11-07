import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { cartSummary } = await load(import.meta.url, "P07-E14.js");

test("עגלה מלאה", () => {
  assert.deepEqual(
    cartSummary([{ name: "מקלדת", price: 249, qty: 1 }, { name: "עכבר", price: 89, qty: 2 }, { name: "כבל", price: 5, qty: 2 }]),
    { itemCount: 5, subtotal: 437, mostExpensive: "מקלדת", lines: ["מקלדת × 1 = 249", "עכבר × 2 = 178", "כבל × 2 = 10"] }
  );
});
test("עגלה ריקה", () => assert.deepEqual(cartSummary([]), { itemCount: 0, subtotal: 0, mostExpensive: null, lines: [] }));
