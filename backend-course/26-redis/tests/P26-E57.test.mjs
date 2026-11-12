import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { cacheMiddleware } = await load(import.meta.url, "P26-E57.ts");

async function start(t) {
  const sb = await redisSandbox(t);
  const calls = { products: 0, missing: 0, me: 0 };
  const app = express();
  app.use(cacheMiddleware(sb.redis, 60));
  app.get("/products", (req, res) => { calls.products++; res.json({ page: Number(req.query.page ?? 1), n: calls.products }); });
  app.get("/missing", (req, res) => { calls.missing++; res.status(404).json({ error: "לא נמצא" }); });
  app.get("/me", (req, res) => { calls.me++; res.json({ user: req.headers.authorization }); });
  app.post("/products", (req, res) => res.status(201).json({ ok: true }));
  const { base, close } = await listen(app);
  t.after(close);
  return { ...sb, base, calls };
}

test("MISS ואז HIT, בלי להריץ את ה־route", async (t) => {
  const { base, calls, raw, prefix } = await start(t);
  const a = await fetch(base + "/products?page=2");
  assert.equal(a.headers.get("x-cache"), "MISS");
  assert.deepEqual(await a.json(), { page: 2, n: 1 });
  const b = await fetch(base + "/products?page=2");
  assert.equal(b.headers.get("x-cache"), "HIT");
  assert.match(b.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await b.json(), { page: 2, n: 1 });
  assert.equal(calls.products, 1);
  const c = await fetch(base + "/products?page=3");
  assert.equal(c.headers.get("x-cache"), "MISS", "URL אחר — מפתח אחר");
  const ttl = await raw.ttl(`${prefix}page:/products?page=2`);
  assert.ok(ttl > 55 && ttl <= 60, `מפתח page:<originalUrl> עם ttl (${ttl})`);
});
test("לא 200 — לא נשמר; Authorization — BYPASS; POST — לא נוגעים", async (t) => {
  const { base, calls, raw, prefix } = await start(t);
  await fetch(base + "/missing");
  const m = await fetch(base + "/missing");
  assert.equal(m.status, 404);
  assert.equal(calls.missing, 2, "404 לא נשמר");
  const d = await fetch(base + "/me", { headers: { Authorization: "Bearer dana" } });
  assert.equal(d.headers.get("x-cache"), "BYPASS");
  const y = await fetch(base + "/me", { headers: { Authorization: "Bearer yossi" } });
  assert.deepEqual(await y.json(), { user: "Bearer yossi" }, "יוסי לא מקבל את התשובה של דנה");
  assert.equal(await raw.exists(`${prefix}page:/me`), 0, "תשובה של משתמש מחובר לא נשמרת");
  const p = await fetch(base + "/products", { method: "POST" });
  assert.equal(p.status, 201);
  assert.equal(p.headers.get("x-cache"), null, "POST — בלי X-Cache");
});
