import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { createBooksCollection } = await load(import.meta.url, "P25.7-E18.ts");
const ok = { title: "Clean Code", price: 120.5, stock: 3, format: "paperback", tags: ["classic"] };

test("מסמך תקין נכנס", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await createBooksCollection(db);
  await db.collection("books").insertOne({ ...ok });
  await db.collection("books").insertOne({ title: "Refactoring", price: 99, stock: 0, format: "ebook" });
  assert.equal(await db.collection("books").countDocuments(), 2);
});
test("מסמכים לא תקינים ← שגיאה 121", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await createBooksCollection(db);
  const bad = [
    { ...ok, title: undefined },
    { ...ok, title: "" },
    { ...ok, price: -1 },
    { ...ok, price: "12" },
    { ...ok, stock: 1.5 },
    { ...ok, stock: -1 },
    { ...ok, format: "audiobook" },
    { ...ok, tags: [1, 2] },
    { ...ok, isbn: "978-0132350884" },
  ];
  for (const doc of bad) {
    const clean = Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined));
    await assert.rejects(db.collection("books").insertOne(clean), (err) => err.code === 121, JSON.stringify(clean));
  }
});
test("גם update נבדק", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await createBooksCollection(db);
  const { insertedId } = await db.collection("books").insertOne({ ...ok });
  await assert.rejects(db.collection("books").updateOne({ _id: insertedId }, { $inc: { stock: -10 } }), (err) => err.code === 121);
});
