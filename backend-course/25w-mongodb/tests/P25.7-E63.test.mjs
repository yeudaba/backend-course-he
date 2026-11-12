import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E63.ts", ["createCustomersCollection"])).createCustomersCollection;
const ok = { name: "Dana", email: "dana@example.com", createdAt: new Date() };

test("תקין ולא תקין", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await f(db);
  const c = db.collection("customers");
  await c.insertOne({ ...ok });
  await c.insertOne({ ...ok, email: "b@x.io", city: "Haifa", addresses: [{ street: "a" }], vip: true });
  const bad = [
    { name: "x", createdAt: new Date() }, { ...ok, email: "c@x.io", name: "" }, { ...ok, email: "no-at" }, { ...ok, email: "a@b@c" },
    { ...ok, email: "d@x.io", createdAt: "2026-11-07" }, { ...ok, email: "e@x.io", city: 5 },
    { ...ok, email: "f@x.io", addresses: Array.from({ length: 6 }, () => ({})) }, { ...ok, email: "g@x.io", addresses: ["str"] },
  ];
  for (const b of bad) await assert.rejects(c.insertOne({ ...b }), (e) => e.code === 121, JSON.stringify(b));
  await assert.rejects(c.insertOne({ ...ok }), (e) => e.code === 11000, "אימייל כפול");
  await assert.rejects(c.updateOne({ email: "dana@example.com" }, { $set: { email: "broken" } }), (e) => e.code === 121, "גם בעדכון");
});
