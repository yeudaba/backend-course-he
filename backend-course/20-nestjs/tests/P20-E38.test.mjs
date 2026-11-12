import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("מחיר עם מע״מ", async (t) => {
  const { PricesModule } = exportsOf(import.meta.url, "P20-E38.ts", ["PricesModule", "PricesService", "PricesController"]);
  const { call } = await nestApp(t, PricesModule);
  assert.deepEqual((await call("GET", "/prices/1")).body, { id: 1, price: 89.9, vat: 16.18, total: 106.08 });
  assert.deepEqual((await call("GET", "/prices/2")).body, { id: 2, price: 19.9, vat: 3.58, total: 23.48 });
  assert.deepEqual((await call("GET", "/prices/3")).body, { id: 3, price: 0.1, vat: 0.02, total: 0.12 });
  const nf = await call("GET", "/prices/4");
  assert.equal(nf.status, 404);
  assert.equal(nf.body?.message, "מוצר 4 לא נמצא");
  assert.equal((await call("GET", "/prices/x")).status, 400);
});
