import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { stockLookup, getStock } = await load(import.meta.url, "P07-E23.js");

test("stockLookup בונה Map אמיתי", () => { const m = stockLookup([{ id: 1, stock: 5 }, { id: 2, stock: 0 }]); assert.equal(m.size, 2); assert.equal(m.get(1), 5); });
test("getStock עם מזהה מה־URL", () => {
  const m = stockLookup([{ id: 1, stock: 5 }, { id: 2, stock: 0 }]);
  assert.equal(getStock(m, "1"), 5);
  assert.equal(getStock(m, "2"), 0);
  assert.equal(getStock(m, "9"), 0);
});
