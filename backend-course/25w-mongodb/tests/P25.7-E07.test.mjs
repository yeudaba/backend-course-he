import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

import { ObjectId } from "mongodb";
const { setupCustomers, createCustomer, DuplicateEmailError } = await load(import.meta.url, "P25.7-E07.ts");

test("יוצר לקוח: ObjectId חדש, אימייל באותיות קטנות, createdAt", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await setupCustomers(db);
  const id = await createCustomer(db, { name: "Noa", email: "  Noa@Example.com ", city: "Eilat" });
  assert.ok(id instanceof ObjectId, "insertedId — ObjectId");
  const doc = await db.collection("customers").findOne({ _id: id });
  assert.equal(doc.email, "noa@example.com");
  assert.ok(doc.createdAt instanceof Date, "createdAt — Date, לא מחרוזת");
});
test("אימייל קיים (גם באותיות גדולות) ← DuplicateEmailError", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await setupCustomers(db);
  await assert.rejects(createCustomer(db, { name: "X", email: "DANA@example.com", city: "Haifa" }), DuplicateEmailError);
  assert.equal(await db.collection("customers").countDocuments(), 4);
});
test("אינדקס ייחודי על email", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await setupCustomers(db);
  const idx = (await db.collection("customers").indexes()).find((i) => i.key.email === 1);
  assert.ok(idx?.unique, "createIndex({ email: 1 }, { unique: true })");
});
