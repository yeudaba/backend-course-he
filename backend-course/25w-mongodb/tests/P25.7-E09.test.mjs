import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { addTag, removeTag } = await load(import.meta.url, "P25.7-E09.ts");
const tags = async (db, id) => (await db.collection("products").findOne({ _id: id })).tags;

test("addTag: מנורמל, ובלי כפילויות", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await addTag(db, "p1", " Organic "), true);
  assert.equal(await addTag(db, "p1", "organic"), true);
  assert.deepEqual(await tags(db, "p1"), ["light", "single-origin", "organic"]);
});
test("removeTag", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await removeTag(db, "p7", "KETTLE"), true);
  assert.deepEqual(await tags(db, "p7"), ["pour-over"]);
});
test("מוצר לא קיים ← false", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await addTag(db, "nope", "x"), false);
  assert.equal(await removeTag(db, "nope", "x"), false);
});
