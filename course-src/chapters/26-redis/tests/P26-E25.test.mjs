import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { take } = await load(import.meta.url, "P26-E25.ts");
const T = 1_700_000_000_000;

test("פרץ עד capacity, ומילוי עם הזמן", async (t) => {
  const { redis } = await redisSandbox(t);
  const o = (now, cost) => ({ capacity: 3, refillPerSecond: 1, now, cost });
  assert.deepEqual(await take(redis, "u", o(T)), { allowed: true, remaining: 2, retryAfterSeconds: 0 });
  await take(redis, "u", o(T));
  await take(redis, "u", o(T));
  assert.deepEqual(await take(redis, "u", o(T)), { allowed: false, remaining: 0, retryAfterSeconds: 1 });
  assert.equal((await take(redis, "u", o(T + 500))).allowed, false, "חצי אסימון");
  assert.equal((await take(redis, "u", o(T + 1000))).allowed, true);
  assert.equal((await take(redis, "u", o(T + 600_000))).remaining, 2, "לא מעבר ל־capacity");
  assert.deepEqual(await take(redis, "u", o(T + 600_000, 3)), { allowed: false, remaining: 2, retryAfterSeconds: 1 }, "cost 3, יש 2");
  assert.ok((await redis.pttl("tb:u")) > 0, "מפתח עם תוקף");
});
test("50 בקשות במקביל משלושה שרתים — בדיוק capacity עוברות", async (t) => {
  const sb = await redisSandbox(t);
  const clients = [sb.redis, await sb.client(), await sb.client()];
  const r = await Promise.all(Array.from({ length: 50 }, (_, i) => take(clients[i % 3], "api", { capacity: 10, refillPerSecond: 0.001, now: T })));
  assert.equal(r.filter((x) => x.allowed).length, 10, "אטומי — לא HMGET ואז HSET מ־Node");
});
