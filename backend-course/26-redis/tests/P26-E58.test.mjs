import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { getOrSetDates } = await load(import.meta.url, "P26-E58.ts");

const value = () => ({
  id: 7,
  createdAt: new Date("2026-11-08T07:58:46.000Z"),
  day: "2026-11-08",
  note: "נשלח ב־2026-11-08T07:58",
  items: [{ at: new Date("2026-11-01T22:00:00.123Z"), qty: 2 }],
  history: [new Date(0), "x"],
});

test("HIT מחזיר בדיוק מה ש־MISS החזיר — כולל Date בכל עומק", async (t) => {
  const { redis } = await redisSandbox(t);
  const miss = await getOrSetDates(redis, "o:7", 60, async () => value());
  const hit = await getOrSetDates(redis, "o:7", 60, async () => assert.fail("HIT לא קורא ל־load"));
  assert.deepEqual(hit, miss);
  assert.ok(hit.createdAt instanceof Date);
  assert.ok(hit.items[0].at instanceof Date);
  assert.ok(hit.history[0] instanceof Date);
  assert.equal(typeof hit.day, "string", "תאריך בלי שעה נשאר מחרוזת");
  assert.equal(typeof hit.note, "string");
});
test("מחרוזות שרק דומות לתאריך נשארות מחרוזות", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await raw.set(`${prefix}s`, JSON.stringify({ a: "2026-11-08T07:58:46Z", b: "7", c: "2026-11-08T07:58:46.000Z" }));
  const got = await getOrSetDates(redis, "s", 60, async () => null);
  assert.equal(got.a, "2026-11-08T07:58:46Z", "בלי מילישניות — לא הפורמט של toISOString");
  assert.equal(got.b, "7");
  assert.ok(got.c instanceof Date);
});
