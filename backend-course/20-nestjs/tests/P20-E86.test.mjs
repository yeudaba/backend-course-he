import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const get = () => exportsOf(import.meta.url, "P20-E86.ts", ["PricesModule", "PricesService", "PricesController"]);

test("GET /menu ו־GET /menu/:name", async (t) => {
  const { PricesModule } = get();
  const { call } = await nestApp(t, PricesModule);
  assert.deepEqual((await call("GET", "/menu")).body, { items: ["cappuccino", "espresso", "latte"] }, "GET /menu");
  assert.deepEqual((await call("GET", "/menu/latte")).body, { name: "latte", price: 14 }, "GET /menu/latte");
  assert.deepEqual((await call("GET", "/menu/Espresso")).body, { name: "espresso", price: 9 }, "GET /menu/Espresso — השם באותיות קטנות");
  assert.deepEqual((await call("GET", "/menu/tea")).body, { name: "tea", price: null }, "GET /menu/tea — משקה שלא קיים: price הוא null (לא חסר)");
});
test("PricesService לבד", () => {
  const { PricesService } = get();
  const s = new PricesService();
  assert.deepEqual(s.menu(), ["cappuccino", "espresso", "latte"], "menu()");
  assert.equal(s.priceOf("cappuccino"), 13, 'priceOf("cappuccino")');
  assert.equal(s.priceOf("mocha"), null, 'priceOf("mocha")');
});
test("ה־controller שואל את ה־service (הבודק מחליף אותו)", async (t) => {
  const { PricesModule, PricesService } = get();
  const fake = { menu: () => ["tea"], priceOf: (name) => (name === "tea" ? 7 : null) };
  const { call } = await nestApp(t, PricesModule, { overrides: [[PricesService, fake]] });
  assert.deepEqual((await call("GET", "/menu")).body, { items: ["tea"] }, "GET /menu עם service אחר — ה־controller לא אמור לדעת את המחירים בעצמו");
  assert.deepEqual((await call("GET", "/menu/TEA")).body, { name: "tea", price: 7 }, "GET /menu/TEA עם service אחר");
});
