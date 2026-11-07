import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { rateLimit } = await load(import.meta.url, "P24-E18.ts");
async function start(t, opts = {}) {
  const clock = { t: 1_000_000 };
  const app = express();
  app.use(rateLimit({ limit: 3, windowMs: 10_000, now: () => clock.t, key: (req) => req.get("x-client") ?? "anon", ...opts }));
  app.get("/", (req, res) => res.json({ ok: true }));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  return { clock, get: (client = "a") => call("GET", "/", undefined, { headers: { "x-client": client } }) };
}

test("עד limit — עובר, עם headers", async (t) => {
  const { get } = await start(t);
  const r1 = await get();
  assert.equal(r1.status, 200);
  assert.equal(r1.headers.get("ratelimit-limit"), "3");
  assert.equal(r1.headers.get("ratelimit-remaining"), "2");
  assert.equal(r1.headers.get("ratelimit-reset"), "10");
  assert.equal((await get()).headers.get("ratelimit-remaining"), "1");
  assert.equal((await get()).headers.get("ratelimit-remaining"), "0");
});
test("מעל — 429 עם Retry-After בשניות", async (t) => {
  const { get, clock } = await start(t);
  await get();
  clock.t += 4000;
  await get();
  await get();
  clock.t += 2500;
  const r = await get();
  assert.equal(r.status, 429);
  assert.equal(typeof r.body.error, "string");
  assert.equal(r.headers.get("retry-after"), "4", "הראשונה (לפני 6.5 שניות) יוצאת מהחלון בעוד 3.5 ← 4");
  assert.equal(r.headers.get("ratelimit-remaining"), "0");
});
test("חלון נע — ונדחות לא נספרות", async (t) => {
  const { get, clock } = await start(t);
  await get(); clock.t += 1000; await get(); clock.t += 1000; await get();
  for (let i = 0; i < 5; i++) assert.equal((await get()).status, 429);
  clock.t += 8000; // הראשונה יצאה
  assert.equal((await get()).status, 200, "מקום אחד התפנה");
  assert.equal((await get()).status, 429);
  clock.t += 1000;
  assert.equal((await get()).status, 200);
});
test("לכל לקוח בנפרד", async (t) => {
  const { get } = await start(t);
  await get("a"); await get("a"); await get("a");
  assert.equal((await get("a")).status, 429);
  assert.equal((await get("b")).status, 200);
});
test("ברירת מחדל: req.ip", async (t) => {
  const clock = { t: 0 };
  const app = express();
  app.use(rateLimit({ limit: 1, windowMs: 1000, now: () => clock.t }));
  app.get("/", (req, res) => res.json({}));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  assert.equal((await call("GET", "/")).status, 200);
  assert.equal((await call("GET", "/", undefined, { headers: { "X-Forwarded-For": "1.2.3.4" } })).status, 429, "X-Forwarded-For לא משנה את req.ip (בלי trust proxy)");
});
