import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { unitsByCategory } = await load(import.meta.url, "P25.7-E22.ts");

test("יחידות לפי קטגוריה — רק paid ו־delivered", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await unitsByCategory(db), [
    { category: "beans", units: 13 },
    { category: "gear", units: 2 },
    { category: "merch", units: 2 },
  ]);
});
