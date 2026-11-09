import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { addReview, averageRating } = await load(import.meta.url, "P25.7-E16.ts");

test("מוסיף דירוג ומעדכן את הממוצע", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await averageRating(db, "p4"), 0);
  assert.equal(await addReview(db, "p4", { by: "c1", rating: 4 }), true);
  assert.equal(await addReview(db, "p4", { by: "c2", rating: 5 }), true);
  assert.equal(await averageRating(db, "p4"), 4.5);
  assert.equal(await averageRating(db, "p3"), 4.7, "14 / 3, מעוגל לספרה אחת");
});
test("אותו לקוח פעמיים ← false, בלי שינוי", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await addReview(db, "p1", { by: "c1", rating: 1 }), false);
  const p = await db.collection("products").findOne({ _id: "p1" });
  assert.equal(p.reviews.length, 2);
  assert.equal(p.ratingSum, 9);
});
test("לא קיים / דירוג לא תקין", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await addReview(db, "nope", { by: "c1", rating: 3 }), false);
  assert.equal(await averageRating(db, "nope"), null);
  for (const r of [0, 6, 3.5]) await assert.rejects(addReview(db, "p4", { by: "c1", rating: r }), RangeError);
});
test("10 דירוגים במקביל — הסיכום תואם למערך", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await Promise.all(Array.from({ length: 10 }, (_, i) => addReview(db, "p7", { by: `u${i}`, rating: (i % 5) + 1 })));
  await Promise.all(Array.from({ length: 5 }, () => addReview(db, "p7", { by: "u1", rating: 5 })));
  const p = await db.collection("products").findOne({ _id: "p7" });
  assert.equal(p.reviews.length, 10);
  assert.equal(p.ratingCount, 10);
  assert.equal(p.ratingSum, p.reviews.reduce((s, r) => s + r.rating, 0));
});
