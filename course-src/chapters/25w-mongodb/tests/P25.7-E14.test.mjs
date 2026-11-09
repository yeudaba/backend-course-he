import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { salesByProduct } = await load(import.meta.url, "P25.7-E14.ts");

test("מכירות לפי מוצר — רק paid ו־delivered", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await salesByProduct(db), [
    { productId: "p3", name: "House Espresso Blend", units: 6, revenue: 288 },
    { productId: "p6", name: "Hand Grinder", units: 1, revenue: 249 },
    { productId: "p1", name: "Ethiopia Yirgacheffe", units: 4, revenue: 248 },
    { productId: "p4", name: "Decaf Brazil", units: 3, revenue: 150 },
    { productId: "p5", name: "V60 Dripper", units: 1, revenue: 89 },
    { productId: "p8", name: "Ceramic Mug", units: 2, revenue: 70 },
  ]);
});
test("לפי המחיר שבהזמנה, לא המחיר הנוכחי", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await db.collection("products").updateMany({}, { $set: { price: 1 } });
  assert.equal((await salesByProduct(db))[0].revenue, 288);
});
