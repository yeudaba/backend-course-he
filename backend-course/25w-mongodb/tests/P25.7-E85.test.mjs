import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E85.ts", ["categoryCsv"])).categoryCsv;

test("CSV", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await f(db), "category,units,revenue\nbeans,13,686\ngear,2,338\nmerch,2,70\n");
  await db.collection("products").updateOne({ _id: "p8" }, { $set: { category: 'merch, "home"' } });
  assert.equal(await f(db), 'category,units,revenue\nbeans,13,686\ngear,2,338\n"merch, ""home""",2,70\n');
});
