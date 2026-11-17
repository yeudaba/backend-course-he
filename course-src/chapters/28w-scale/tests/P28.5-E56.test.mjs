import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { shedLoad } = await load(import.meta.url, "P28.5-E56.ts");

async function start(t, opts) {
  const app = express();
  app.use(shedLoad(opts));
  app.get(["/health", "/ready", "/api", "/metrics"], (req, res) => res.json({ ok: req.path }));
  const { base, close } = await listen(app);
  t.after(close);
  return (p) => fetch(base + p);
}

test("מתחת לסף ← עובר, עם X-Lag-Ms", async (t) => {
  let lag = 12.4;
  const get = await start(t, { getLagMs: () => lag, maxLagMs: 100 });
  let r = await get("/api");
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-lag-ms"), "12");
  lag = 100;
  assert.equal((await get("/api")).status, 200, "בדיוק בסף — עובר");
  lag = 250.6;
  r = await get("/api");
  assert.equal(r.status, 503);
  assert.deepEqual(await r.json(), { error: "overloaded" });
  assert.equal(r.headers.get("retry-after"), "2");
  assert.equal(r.headers.get("x-lag-ms"), "251");
  assert.equal((await get("/health")).status, 200);
  assert.equal((await get("/ready")).status, 200);
});
test("exempt מותאם", async (t) => {
  const get = await start(t, { getLagMs: () => 999, maxLagMs: 10, exempt: ["/metrics"] });
  assert.equal((await get("/metrics")).status, 200);
  assert.equal((await get("/health")).status, 503);
});
