import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { hit } = await load(import.meta.url, "P26-E09.ts");
const T0 = Date.parse("2026-11-08T10:00:05Z");

test("עד limit בחלון", async (t) => {
  const { redis } = await redisSandbox(t);
  const opts = { limit: 3, windowSeconds: 60, now: T0 };
  assert.deepEqual(await hit(redis, "ip-1", opts), { allowed: true, remaining: 2, resetSeconds: 55 });
  await hit(redis, "ip-1", opts);
  assert.equal((await hit(redis, "ip-1", opts)).remaining, 0);
  assert.deepEqual(await hit(redis, "ip-1", opts), { allowed: false, remaining: 0, resetSeconds: 55 });
  assert.equal((await hit(redis, "ip-2", opts)).allowed, true, "לקוח אחר — מונה משלו");
  assert.equal((await hit(redis, "ip-1", { ...opts, now: T0 + 55_000 })).allowed, true, "חלון חדש");
});
test("המונה מת לבד", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await hit(redis, "ip-1", { limit: 3, windowSeconds: 60, now: T0 });
  const keys = await raw.keys(`${prefix}*`);
  assert.equal(keys.length, 1, "מפתח אחד לחלון");
  const ttl = await raw.ttl(keys[0]);
  assert.ok(ttl > 0 && ttl <= 60, `TTL על המונה (${ttl}) — אחרת Redis מתמלא במונים ישנים`);
  await hit(redis, "ip-1", { limit: 3, windowSeconds: 60, now: T0 });
  assert.ok((await raw.ttl(keys[0])) <= ttl, "בקשה נוספת לא מאריכה את החלון");
});

test("שני שרתים, 20 בקשות במקביל — בדיוק limit עוברות", async (t) => {
  const sb = await redisSandbox(t);
  const other = await sb.client();
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => hit(i % 2 ? sb.redis : other, "ip-1", { limit: 5, windowSeconds: 60, now: T0 })));
  assert.equal(results.filter((r) => r.allowed).length, 5, "INCR אטומי ומשותף — לא GET ואז SET, ולא Map בזיכרון");
});
