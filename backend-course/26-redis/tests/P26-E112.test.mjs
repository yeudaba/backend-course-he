import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { sseWithHeartbeat } = await load(import.meta.url, "P26-E112.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect(base) {
  const ac = new AbortController();
  const res = await fetch(base + "/events", { signal: ac.signal });
  const s = { res, text: "", close: () => ac.abort() };
  (async () => {
    const dec = new TextDecoder();
    try { for await (const c of res.body) s.text += dec.decode(c, { stream: true }); } catch { /* נסגר */ }
  })();
  return s;
}

test("headers, ‏connected, ‏ping כל intervalMs, וניקוי בסגירה", async (t) => {
  const sse = sseWithHeartbeat({ intervalMs: 60 });
  const app = express();
  app.get("/events", sse.handler);
  const { base, close } = await listen(app);
  t.after(close);
  const a = await connect(base);
  const b = await connect(base);
  assert.equal(a.res.status, 200);
  assert.match(a.res.headers.get("content-type"), /^text\/event-stream/);
  assert.equal(a.res.headers.get("cache-control"), "no-cache");
  assert.equal(a.res.headers.get("x-accel-buffering"), "no");
  await sleep(220);
  assert.equal(sse.active(), 2);
  assert.ok(a.text.startsWith(": connected\n\n"), JSON.stringify(a.text.slice(0, 30)));
  const pings = a.text.split(": ping\n\n").length - 1;
  assert.ok(pings >= 2 && pings <= 4, `${pings} pings ב־220ms עם interval של 60`);
  a.close();
  await sleep(100);
  assert.equal(sse.active(), 1, "לקוח שסגר יוצא מהספירה");
  b.close();
  await sleep(100);
  assert.equal(sse.active(), 0);
});
