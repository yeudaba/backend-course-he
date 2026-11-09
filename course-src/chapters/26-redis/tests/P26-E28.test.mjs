import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { eventHub } = await load(import.meta.url, "P26-E28.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start(t, opts) {
  const hub = eventHub(opts);
  const app = express();
  app.get("/events", hub.handler);
  const { base, close } = await listen(app);
  t.after(close);
  return { hub, base };
}
// מתחבר לזרם וקורא אותו ברקע
async function connect(base, headers = {}) {
  const ac = new AbortController();
  const res = await fetch(base + "/events", { headers, signal: ac.signal });
  const stream = { res, text: "", close: () => ac.abort() };
  (async () => {
    const dec = new TextDecoder();
    try { for await (const chunk of res.body) stream.text += dec.decode(chunk, { stream: true }); } catch { /* נסגר */ }
  })();
  return stream;
}
const ids = (text) => [...text.matchAll(/^id: (\d+)$/gm)].map((m) => +m[1]);

test("headers של SSE, וכל אירוע מגיע לכל המחוברים עם id עולה", async (t) => {
  const { hub, base } = await start(t);
  const a = await connect(base);
  const b = await connect(base);
  t.after(() => { a.close(); b.close(); });
  assert.equal(a.res.status, 200);
  assert.match(a.res.headers.get("content-type"), /^text\/event-stream/);
  assert.equal(a.res.headers.get("cache-control"), "no-cache");
  await sleep(20);
  assert.equal(hub.size(), 2);
  assert.equal(hub.publish("order", { id: 7 }), 1);
  assert.equal(hub.publish("order", { id: 8 }), 2);
  await sleep(50);
  for (const s of [a, b]) assert.equal(s.text, 'id: 1\nevent: order\ndata: {"id":7}\n\nid: 2\nevent: order\ndata: {"id":8}\n\n');
});
test("Last-Event-ID: מי שחוזר מקבל את מה שפספס", async (t) => {
  const { hub, base } = await start(t);
  hub.publish("x", 1); hub.publish("x", 2); hub.publish("x", 3);
  const s = await connect(base, { "Last-Event-ID": "1" });
  t.after(() => s.close());
  await sleep(30);
  assert.deepEqual(ids(s.text), [2, 3]);
  hub.publish("x", 4);
  await sleep(30);
  assert.deepEqual(ids(s.text), [2, 3, 4]);
});
test("בלי Last-Event-ID — רק אירועים חדשים; והמאגר מוגבל ל־bufferSize", async (t) => {
  const { hub, base } = await start(t, { bufferSize: 2 });
  for (let i = 0; i < 5; i++) hub.publish("x", i);
  const fresh = await connect(base);
  const back = await connect(base, { "Last-Event-ID": "0" });
  t.after(() => { fresh.close(); back.close(); });
  await sleep(30);
  assert.equal(fresh.text, "");
  assert.deepEqual(ids(back.text), [4, 5], "רק 2 האחרונים נשמרו");
});
test("לקוח שהתנתק — יוצא מהרשימה", async (t) => {
  const { hub, base } = await start(t);
  const a = await connect(base);
  await sleep(20);
  assert.equal(hub.size(), 1);
  a.close();
  await sleep(50);
  assert.equal(hub.size(), 0, "req.on('close') — אחרת דליפה");
  hub.publish("x", 1); // לא זורק
});
