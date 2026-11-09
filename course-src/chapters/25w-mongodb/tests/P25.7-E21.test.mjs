import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { updateProfile } = await load(import.meta.url, "P25.7-E21.ts");

test("מעדכן שם — ושאר השדות נשארים", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const doc = await updateProfile(db, "c1", { name: "Dana L." });
  assert.equal(doc?.name, "Dana L.", "מחזיר את המסמך אחרי העדכון");
  const saved = await db.collection("customers").findOne({ _id: "c1" });
  assert.equal(saved.name, "Dana L.");
  assert.equal(saved.email, "dana@example.com", "האימייל לא נמחק");
  assert.ok(saved.createdAt instanceof Date);
});
test("רק name ו־city; שדות אחרים מתעלמים", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await updateProfile(db, "c2", { city: "Akko", role: "admin", email: "hacker@evil.com" });
  const saved = await db.collection("customers").findOne({ _id: "c2" });
  assert.equal(saved.city, "Akko");
  assert.equal(saved.role, undefined);
  assert.equal(saved.email, "yossi@example.com");
});
test("אין מה לעדכן ← RangeError; לקוח לא קיים ← null", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await assert.rejects(updateProfile(db, "c1", { role: "admin" }), RangeError);
  assert.equal(await updateProfile(db, "nope", { name: "x" }), null);
});
