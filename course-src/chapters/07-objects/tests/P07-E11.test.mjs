import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { withPrice, without, withTag } = await load(import.meta.url, "P07-E11.js");

const make = () => ({ name: "עט", price: 5, tags: ["משרד"] });
test("withPrice", () => { const p = make(); assert.deepEqual(withPrice(p, 4), { name: "עט", price: 4, tags: ["משרד"] }); assert.equal(p.price, 5); });
test("without", () => { const p = make(); assert.deepEqual(without(p, "tags"), { name: "עט", price: 5 }); assert.deepEqual(p, make()); });
test("withTag לא נוגע במערך המקורי", () => {
  const p = make();
  const r = withTag(p, "כחול");
  assert.deepEqual(r.tags, ["משרד", "כחול"]);
  assert.deepEqual(p.tags, ["משרד"]);
});
