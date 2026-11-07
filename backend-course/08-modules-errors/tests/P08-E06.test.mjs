import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { receipt } = await load(import.meta.url, "P08-E06.js");

import { load as load2 } from "../../tools/load.mjs";
const fmt = await load2(import.meta.url, "P08-E06-format.js");
test("formatPrice ו־formatLine יוצאו מהמודול", () => {
  assert.equal(fmt.formatPrice(12.5), "₪12.50");
  assert.equal(fmt.formatLine("עט", 5), "עט: ₪5.00");
});
test("receipt", () => assert.equal(receipt([{ name: "עט", price: 5 }, { name: "מחברת", price: 12.5 }]), "עט: ₪5.00\nמחברת: ₪12.50\nסה״כ: ₪17.50"));
test("receipt ריק", () => assert.equal(receipt([]), "סה״כ: ₪0.00"));
