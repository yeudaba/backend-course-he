import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { orderEvents } = await load(import.meta.url, "P26-E114.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start(t) {
  const bus = new EventEmitter();
  const owners = { 7: 1, 8: 2 };
  const app = express();
  app.get("/orders/:id/events", orderEvents({
    authenticate: (req) => (req.headers.authorization ? Number(req.headers.authorization.replace("Bearer user", "")) : null),
    ownerOf: async (id) => owners[id] ?? null,
    bus,
  }));
  const { base, close } = await listen(app);
  t.after(close);
  return { base, bus };
}
async function connect(base, id, user) {
  const ac = new AbortController();
  const res = await fetch(`${base}/orders/${id}/events`, { signal: ac.signal, headers: user ? { Authorization: `Bearer user${user}` } : {} });
  const s = { res, text: "", close: () => ac.abort() };
  if (res.status === 200) (async () => {
    const dec = new TextDecoder();
    try { for await (const c of res.body) s.text += dec.decode(c, { stream: true }); } catch { /* נסגר */ }
  })();
  return s;
}

test("401, 404 לזר ולהזמנה שלא קיימת", async (t) => {
  const { base, bus } = await start(t);
  const anon = await connect(base, 7);
  assert.equal(anon.res.status, 401);
  assert.ok((await anon.res.json()).error);
  assert.equal((await connect(base, 7, 2)).res.status, 404, "של משתמש אחר ← 404");
  assert.equal((await connect(base, 99, 1)).res.status, 404);
  assert.equal(bus.listenerCount("status"), 0, "שום מאזין לא נרשם");
});
test("הבעלים מקבל רק את האירועים של ההזמנה שלו, והמאזין יורד בסגירה", async (t) => {
  const { base, bus } = await start(t);
  const s = await connect(base, 7, 1);
  assert.equal(s.res.status, 200);
  assert.match(s.res.headers.get("content-type"), /^text\/event-stream/);
  assert.equal(s.res.headers.get("cache-control"), "no-cache");
  await sleep(30);
  assert.equal(bus.listenerCount("status"), 1);
  bus.emit("status", { orderId: 8, status: "paid" });
  bus.emit("status", { orderId: 7, status: "shipped" });
  await sleep(50);
  assert.ok(s.text.includes('event: status\ndata: {"orderId":7,"status":"shipped"}\n\n'), JSON.stringify(s.text));
  assert.ok(!s.text.includes('"orderId":8'), "אירוע של הזמנה אחרת דלף");
  s.close();
  await sleep(100);
  assert.equal(bus.listenerCount("status"), 0, "המאזין לא ירד מה־bus אחרי שהלקוח סגר");
});
