import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E34.ts", ["productCard"])).productCard;

test("כרטיס", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, "p1"), { id: "p1", name: "Ethiopia Yirgacheffe", price: 62, roast: "light" });
  assert.deepEqual(await f(db, "p6"), { id: "p6", name: "Hand Grinder", price: 249, roast: null });
  assert.equal(await f(db, "p99"), null);
  await db.collection("products").insertOne({ _id: "x1", name: "Bare", price: 1 });
  assert.deepEqual(await f(db, "x1"), { id: "x1", name: "Bare", price: 1, roast: null }, "בלי specs בכלל");
});
test("projection — לא מביא את כל המסמך", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  let opts;
  const col = db.collection("products");
  const spy = { collection: () => ({ findOne: (q, o) => { opts = o; return col.findOne(q, o); } }) };
  await f(spy, "p1");
  const proj = opts?.projection ?? {};
  assert.ok(proj.name && proj.price && proj["specs.roast"], "projection עם name, price ו־specs.roast");
  assert.equal(proj.reviews, undefined);
});
