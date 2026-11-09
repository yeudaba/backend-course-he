import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { restock } = await load(import.meta.url, "P25.7-E08.ts");

test("מוסיף ומחזיר את המלאי החדש", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await restock(db, "p2", 10), 10);
  assert.equal(await restock(db, "p2", 5), 15);
  assert.equal((await db.collection("products").findOne({ _id: "p2" })).stock, 15);
});
test("מוצר לא קיים ← null", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await restock(db, "nope", 3), null);
});
test("כמות לא תקינה ← RangeError", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  for (const q of [0, -2, 1.5]) await assert.rejects(restock(db, "p1", q), RangeError);
});
test("20 עדכונים במקביל — אף אחד לא הולך לאיבוד", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await Promise.all(Array.from({ length: 20 }, () => restock(db, "p4", 1)));
  assert.equal((await db.collection("products").findOne({ _id: "p4" })).stock, 35);
});
