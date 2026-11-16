import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createRedisBudget } = await load(import.meta.url, "P29-E82.ts");

test("סופר במיליוניות, עוצר בתקרה, בלי שגיאות עיגול", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const now = () => Date.UTC(2026, 10, 16, 21, 30);
  const b = createRedisBudget(redis, { dailyUsdPerUser: 0.5, now });
  assert.deepEqual(await b.check("u1"), { allowed: true, remainingUsd: 0.5 });
  await b.record("u1", 0.1);
  await b.record("u1", 0.2);
  assert.deepEqual(await b.check("u1"), { allowed: true, remainingUsd: 0.2 });
  assert.equal(await raw.get(`${prefix}ai:budget:u1:2026-11-16`), "300000", "מיליוניות, מספר שלם");
  const ttl = await raw.ttl(`${prefix}ai:budget:u1:2026-11-16`);
  assert.ok(ttl > 172790 && ttl <= 172800, `EXPIRE של יומיים (${ttl})`);
  await b.record("u1", 0.2);
  assert.deepEqual(await b.check("u1"), { allowed: false, remainingUsd: 0 });
  await b.record("u1", 0.0000014);
  assert.equal(await raw.get(`${prefix}ai:budget:u1:2026-11-16`), "500001");
  assert.deepEqual(await b.check("u1"), { allowed: false, remainingUsd: 0 });
  assert.deepEqual(await b.check("u2"), { allowed: true, remainingUsd: 0.5 }, "משתמש אחר");
});
test("שני עותקים של השרת — אותו תקציב; יום חדש ב־UTC — מתאפס", async (t) => {
  const { redis } = await redisSandbox(t);
  let ms = Date.UTC(2026, 10, 16, 23, 59);
  const now = () => ms;
  const a = createRedisBudget(redis, { dailyUsdPerUser: 1, now });
  const b = createRedisBudget(redis, { dailyUsdPerUser: 1, now });
  await a.record("u", 0.6);
  await b.record("u", 0.3);
  assert.deepEqual(await a.check("u"), { allowed: true, remainingUsd: 0.1 });
  assert.deepEqual(await b.check("u"), { allowed: true, remainingUsd: 0.1 });
  ms = Date.UTC(2026, 10, 17, 0, 1);
  assert.deepEqual(await a.check("u"), { allowed: true, remainingUsd: 1 }, "אחרי חצות UTC");
});
test("קלט לא תקין", async (t) => {
  const { redis } = await redisSandbox(t);
  const b = createRedisBudget(redis, { dailyUsdPerUser: 1 });
  for (const v of [-0.01, NaN, Infinity]) await assert.rejects(b.record("u", v), RangeError, String(v));
  await b.record("u", 0);
  assert.equal((await b.check("u")).remainingUsd, 1);
});
