import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { saveProfile, loadProfile } = await load(import.meta.url, "P26-E44.ts");

test("שמירה וטעינה עם טיפוסים", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const p = await saveProfile(redis, 7, { name: "  דנה ", city: "חיפה", age: 30 });
  assert.deepEqual(p, { name: "דנה", city: "חיפה", age: 30, newsletter: false }, "trim וברירת מחדל");
  assert.deepEqual(await loadProfile(redis, 7), { name: "דנה", city: "חיפה", age: 30, newsletter: false });
  assert.equal(await raw.hget(`${prefix}profile:7`, "newsletter"), "0");
  assert.equal(await raw.hget(`${prefix}profile:7`, "age"), "30");
  await saveProfile(redis, 8, { name: "יוסי", city: "אילת", age: 13, newsletter: true });
  const y = await loadProfile(redis, 8);
  assert.deepEqual(y, { name: "יוסי", city: "אילת", age: 13, newsletter: true });
  assert.equal(typeof y.age, "number");
  assert.equal(await raw.hget(`${prefix}profile:8`, "newsletter"), "1");
  assert.equal(await loadProfile(redis, 99), null);
});
test("קלט לא תקין ← VALIDATION_ERROR, ושום דבר לא נכתב", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const bad = [
    { name: " ", city: "חיפה", age: 30 },
    { name: "דנה", city: "חיפה", age: 12 },
    { name: "דנה", city: "חיפה", age: 30.5 },
    { name: "דנה", city: "חיפה", age: "30" },
    { name: "דנה", city: "חיפה", age: 30, role: "admin" },
    { name: "דנה", age: 30 },
    null,
  ];
  for (const b of bad) await assert.rejects(saveProfile(redis, 5, b), { message: "VALIDATION_ERROR" }, JSON.stringify(b));
  assert.equal(await raw.exists(`${prefix}profile:5`), 0);
});
