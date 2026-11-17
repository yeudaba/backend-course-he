import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E49.ts", ["updatePrice"])).updatePrice;

test("updated, conflict, not_found", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await f(db, "p1", 62, 65), "updated");
  assert.equal(await f(db, "p1", 62, 70), "conflict", "מישהו כבר שינה ל־65");
  assert.equal((await db.collection("products").findOne({ _id: "p1" })).price, 65);
  assert.equal(await f(db, "p1", 65, 65), "updated", "אותו מחיר");
  assert.equal(await f(db, "p99", 1, 2), "not_found");
  for (const bad of [0, -5, 1.5]) await assert.rejects(f(db, "p1", 65, bad), RangeError);
});
test("שני מנהלים במקביל — רק אחד", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  const r = await Promise.all([f(db, "p6", 249, 239), f(db, "p6", 249, 259), f(db, "p6", 249, 269)]);
  assert.equal(r.filter((x) => x === "updated").length, 1);
  assert.equal(r.filter((x) => x === "conflict").length, 2);
});
