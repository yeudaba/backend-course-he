import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { rateLimit } = await load(import.meta.url, "P26-E69.ts");

async function server(t, redis, opts) {
  const app = express();
  app.use(rateLimit(redis, opts));
  app.get("/", (req, res) => res.json({ ok: true }));
  const { base, close } = await listen(app);
  t.after(close);
  return base;
}

test("שני שרתים, מגבלה אחת", async (t) => {
  const sb = await redisSandbox(t);
  const second = await sb.client();
  const clock = { t: 1_800_000_000_000 + 13_000 }; // 13 שניות לתוך חלון של דקה
  const opts = { limit: 5, windowSeconds: 60, keyOf: (req) => req.headers["x-user"] ?? "anon", now: () => clock.t };
  const a = await server(t, sb.redis, opts);
  const b = await server(t, second, opts);
  const results = [];
  for (let i = 0; i < 10; i++) results.push(await fetch((i % 2 ? b : a) + "/", { headers: { "x-user": "dana" } }));
  assert.deepEqual(results.map((r) => r.status), [200, 200, 200, 200, 200, 429, 429, 429, 429, 429]);
  assert.equal(results[0].headers.get("x-ratelimit-limit"), "5");
  assert.equal(results[0].headers.get("x-ratelimit-remaining"), "4");
  assert.equal(results[4].headers.get("x-ratelimit-remaining"), "0");
  assert.equal(results[7].headers.get("x-ratelimit-remaining"), "0", "לא שלילי");
  assert.equal(results[5].headers.get("retry-after"), "47", "47 שניות עד סוף החלון");
  assert.ok((await results[5].json()).error);
  const yossi = await fetch(a + "/", { headers: { "x-user": "yossi" } });
  assert.equal(yossi.status, 200, "לקוח אחר — מונה משלו");
  clock.t += 47_000;
  assert.equal((await fetch(a + "/", { headers: { "x-user": "dana" } })).status, 200, "חלון חדש");
});
test("Retry-After מעוגל למעלה, ותוקף למפתח", async (t) => {
  const sb = await redisSandbox(t);
  const clock = { t: 1_800_000_000_000 + 59_500 };
  const base = await server(t, sb.redis, { limit: 1, windowSeconds: 60, keyOf: () => "k", now: () => clock.t });
  await fetch(base + "/");
  const r = await fetch(base + "/");
  assert.equal(r.status, 429);
  assert.equal(r.headers.get("retry-after"), "1", "חצי שנייה ← 1, לא 0");
  const keys = await sb.raw.keys(`${sb.prefix}rl:k:*`);
  assert.equal(keys.length, 1, "מפתח rl:<key>:<window>");
  assert.equal(keys[0], `${sb.prefix}rl:k:${Math.floor(clock.t / 60000)}`);
  const ttl = await sb.raw.ttl(keys[0]);
  assert.ok(ttl > 0 && ttl <= 60, `ttl ${ttl}`);
});
