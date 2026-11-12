import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E64.ts", ["addAddress"])).addAddress;
const addr = (i) => ({ label: `a${i}`, street: `Street ${i}`, city: "Haifa" });

test("עד 5, ואז limit", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  for (let i = 1; i <= 5; i++) assert.equal(await f(db, "c1", addr(i)), "added");
  assert.equal(await f(db, "c1", addr(6)), "limit");
  assert.equal(await f(db, "c99", addr(1)), "not_found");
  assert.deepEqual((await db.collection("customers").findOne({ _id: "c1" })).addresses.map((a) => a.label), ["a1", "a2", "a3", "a4", "a5"]);
});
test("10 במקביל — לא יותר מ־5", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  await f(db, "c2", addr(0));
  const r = await Promise.all(Array.from({ length: 10 }, (_, i) => f(db, "c2", addr(i + 1))));
  assert.equal(r.filter((x) => x === "added").length, 4);
  assert.equal((await db.collection("customers").findOne({ _id: "c2" })).addresses.length, 5);
});
