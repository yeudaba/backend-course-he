import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { productsPage } = await load(import.meta.url, "P25.7-E10.ts");
const names = (r) => r.items.map((i) => i.name);

test("עמוד 1 ועמוד 3, ממוין לפי שם", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const p1 = await productsPage(db, { page: 1, pageSize: 3 });
  assert.deepEqual(names(p1), ["Ceramic Mug", "Colombia Huila", "Decaf Brazil"]);
  assert.equal(p1.total, 8);
  assert.equal(p1.totalPages, 3);
  assert.deepEqual(names(await productsPage(db, { page: 3, pageSize: 3 })), ["House Espresso Blend", "V60 Dripper"]);
});
test("הספירה לפי אותו פילטר", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const r = await productsPage(db, { page: 2, pageSize: 3, category: "beans" });
  assert.deepEqual(names(r), ["House Espresso Blend"]);
  assert.equal(r.total, 4);
  assert.equal(r.totalPages, 2);
});
test("רק name ו־price (ו־_id)", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const r = await productsPage(db);
  assert.deepEqual(Object.keys(r.items[0]).sort(), ["_id", "name", "price"]);
});
test("ערכים לא תקינים ← RangeError", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  for (const o of [{ page: 0 }, { pageSize: 0 }, { pageSize: 51 }, { page: 1.5 }]) await assert.rejects(productsPage(db, o), RangeError);
});
