import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { CartModule } = loadNest(import.meta.url, "P20-E23.ts");

test("שתי אפליקציות — שתי עגלות נפרדות", async (t) => {
  const a = await nestApp(t, CartModule);
  const b = await nestApp(t, CartModule);
  assert.deepEqual((await a.call("POST", "/cart", { product: "Mug", qty: 2 })).body, { id: 1, product: "Mug", qty: 2 });
  assert.deepEqual((await a.call("POST", "/cart", { product: "Jug", qty: 1 })).body.id, 2);
  assert.deepEqual((await b.call("GET", "/cart")).body, [], "העגלה של b ריקה");
  assert.deepEqual((await b.call("POST", "/cart", { product: "Cup", qty: 1 })).body, { id: 1, product: "Cup", qty: 1 }, "ה־ids של b מתחילים מ־1");
  assert.equal((await a.call("GET", "/cart")).body.length, 2);
});
