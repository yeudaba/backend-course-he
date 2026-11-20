import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E102.ts", ["addReview"])).addReview;
const summary = async (db, id) => {
  const p = await db.collection("products").findOne({ _id: id });
  return { count: p.ratingCount, sum: p.ratingSum, reviews: p.reviews.length };
};

test("ביקורת חדשה מעדכנת את שני השדות", async (t) => {
  const add = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await add(db, "p4", { by: "c1", rating: 5 }), true);
  assert.deepEqual(await summary(db, "p4"), { count: 1, sum: 5, reviews: 1 }, "ratingCount ו־ratingSum");
  assert.equal(await add(db, "p1", { by: "c4", rating: 3 }), true);
  assert.deepEqual(await summary(db, "p1"), { count: 3, sum: 12, reviews: 3 });
});
test("לקוח שכבר כתב, ומוצר שלא קיים ← false", async (t) => {
  const add = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await add(db, "p1", { by: "c1", rating: 1 }), false);
  assert.deepEqual(await summary(db, "p1"), { count: 2, sum: 9, reviews: 2 });
  assert.equal(await add(db, "p99", { by: "c1", rating: 4 }), false);
});
test("rating לא תקין ← RangeError, בלי שינוי", async (t) => {
  const add = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  for (const rating of [0, 6, 7, 2.5]) await assert.rejects(add(db, "p4", { by: "c2", rating }), RangeError, `rating ${rating}`);
  assert.deepEqual(await summary(db, "p4"), { count: 0, sum: 0, reviews: 0 });
});
test("במקביל: שני לקוחות — שניהם נספרים; אותו לקוח פעמיים — פעם אחת", async (t) => {
  const add = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  await Promise.all([add(db, "p7", { by: "c1", rating: 5 }), add(db, "p7", { by: "c2", rating: 3 }), add(db, "p7", { by: "c3", rating: 4 })]);
  assert.deepEqual(await summary(db, "p7"), { count: 3, sum: 12, reviews: 3 }, "ביקורות במקביל — הסכום צריך לכלול את כולן ($inc, לא $set)");
  const twice = await Promise.all([add(db, "p4", { by: "c4", rating: 5 }), add(db, "p4", { by: "c4", rating: 5 })]);
  assert.deepEqual(twice.sort(), [false, true], "לחיצה כפולה — רק אחת מצליחה");
  assert.deepEqual(await summary(db, "p4"), { count: 1, sum: 5, reviews: 1 });
});
