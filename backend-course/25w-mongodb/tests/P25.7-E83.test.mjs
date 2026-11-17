import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E83.ts", ["popularTags"])).popularTags;

test("תגיות", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, 3), [
    { tag: "medium", products: 2, inStock: 1 }, { tag: "pour-over", products: 2, inStock: 1 }, { tag: "single-origin", products: 2, inStock: 1 },
  ]);
  await db.collection("products").insertOne({ _id: "x", tags: ["pour-over", "gift"], stock: 3 });
  assert.deepEqual((await f(db, 2)), [{ tag: "pour-over", products: 3, inStock: 2 }, { tag: "medium", products: 2, inStock: 1 }]);
  assert.equal((await f(db, 100)).length, 11);
});
