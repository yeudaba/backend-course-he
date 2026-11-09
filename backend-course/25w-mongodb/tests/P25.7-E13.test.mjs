import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { reserveStock } = await load(import.meta.url, "P25.7-E13.ts");
const stock = async (db, id) => (await db.collection("products").findOne({ _id: id })).stock;

test("יש מספיק ← מוריד; אין ← false ולא נוגע", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await reserveStock(db, "p6", 3), true);
  assert.equal(await stock(db, "p6"), 2);
  assert.equal(await reserveStock(db, "p6", 3), false);
  assert.equal(await stock(db, "p6"), 2);
  assert.equal(await reserveStock(db, "nope", 1), false);
});
test("40 בקשות במקביל על 15 במלאי — בדיוק 15 מצליחות", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const results = await Promise.all(Array.from({ length: 40 }, () => reserveStock(db, "p4", 1)));
  assert.equal(results.filter(Boolean).length, 15);
  assert.equal(await stock(db, "p4"), 0, "לא שלילי");
});
test("כמות לא תקינה ← RangeError", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  for (const q of [0, -1, 2.5]) await assert.rejects(reserveStock(db, "p1", q), RangeError);
});
