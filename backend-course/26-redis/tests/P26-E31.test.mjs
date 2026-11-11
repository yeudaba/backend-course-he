import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const FILE = "P26-E31.ts";
const get = () => exportsOf(import.meta.url, FILE, ["createSession", "getSession", "destroySession", "destroyAllForUser"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("createSession: hash עם userId, תוקף, ורשימת ה־sessions של המשתמש", async (t) => {
  const { createSession, getSession } = await get();
  const { redis } = await redisSandbox(t);
  const id = await createSession(redis, 7, { device: "laptop", ip: "10.0.0.5" });
  assert.match(id, UUID, "המזהה — randomUUID(), שאי אפשר לנחש");
  assert.deepEqual(await redis.hgetall(`session:${id}`), { device: "laptop", ip: "10.0.0.5", userId: "7" }, "המפתח session:<id> הוא hash");
  const ttl = await redis.ttl(`session:${id}`);
  assert.ok(ttl > 1790 && ttl <= 1800, `ברירת המחדל 1800 שניות (קיבלנו ${ttl})`);
  assert.deepEqual(await redis.smembers("user:7:sessions"), [id]);
  assert.ok((await redis.ttl("user:7:sessions")) > 0, "גם לרשימה של המשתמש יש תוקף — אחרת היא נשארת לנצח");
  assert.deepEqual(await getSession(redis, id), { userId: 7, data: { device: "laptop", ip: "10.0.0.5" } }, "userId כמספר, ובלי userId בתוך data");
  assert.notEqual(await createSession(redis, 7), id, "כל session — מזהה חדש");
});
test("session קצר לא מקצר את הרשימה של המשתמש", async (t) => {
  const { createSession } = await get();
  const { redis } = await redisSandbox(t);
  await createSession(redis, 7, {}, 1800);
  await createSession(redis, 7, {}, 60);
  assert.ok((await redis.ttl("user:7:sessions")) > 1700, "הרשימה צריכה לחיות כמו ה־session הארוך שבה (EXPIRE ... NX ואז GT)");
});
test("getSession: לא קיים ← null, וכל קריאה מאריכה את התוקף", async (t) => {
  const { createSession, getSession } = await get();
  const { redis } = await redisSandbox(t);
  assert.equal(await getSession(redis, "nope"), null);
  const id = await createSession(redis, 3, { a: "1" }, 100);
  await redis.expire(`session:${id}`, 5);
  await getSession(redis, id, 100);
  assert.ok((await redis.ttl(`session:${id}`)) > 90, "sliding expiration: getSession מחזיר את התוקף ל־ttlSec");
  await redis.del(`session:${id}`); // "פג תוקף"
  assert.equal(await getSession(redis, id), null);
});
test("destroySession ו־destroyAllForUser", async (t) => {
  const { createSession, getSession, destroySession, destroyAllForUser } = await get();
  const { redis } = await redisSandbox(t);
  const a = await createSession(redis, 7, { device: "laptop" });
  const b = await createSession(redis, 7, { device: "phone" });
  const c = await createSession(redis, 7, { device: "tablet" });
  const other = await createSession(redis, 8, { device: "laptop" });
  assert.equal(await destroySession(redis, a), true);
  assert.equal(await destroySession(redis, a), false, "פעם שנייה — כבר לא קיים");
  assert.equal(await getSession(redis, a), null);
  assert.deepEqual((await redis.smembers("user:7:sessions")).sort(), [b, c].sort(), "destroySession מוציא גם מהרשימה של המשתמש");
  await redis.del(`session:${c}`); // פג מעצמו, ועדיין ברשימה
  assert.equal(await destroyAllForUser(redis, 7), 1, "מחזיר כמה sessions באמת נמחקו (c כבר פג)");
  assert.equal(await getSession(redis, b), null);
  assert.equal(await redis.exists("user:7:sessions"), 0, "גם הרשימה עצמה נמחקת");
  assert.notEqual(await getSession(redis, other), null, "משתמש אחר — לא נוגעים");
  assert.equal(await destroyAllForUser(redis, 99), 0);
});
