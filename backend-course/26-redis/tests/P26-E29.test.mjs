import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load } from "../../tools/load.mjs";

const { createChatServer } = await load(import.meta.url, "P26-E29.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TOKENS = { "t-dana": "dana", "t-yossi": "yossi", "t-avi": "avi" };

async function start(t) {
  const server = http.createServer((req, res) => res.end("ok"));
  const chat = createChatServer(server, { verifyToken: (tok) => TOKENS[tok] ?? null });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const ws = `ws://127.0.0.1:${server.address().port}`;
  t.after(async () => { await chat?.close?.(); server.closeAllConnections(); await new Promise((r) => server.close(r)); });
  return ws;
}
// לקוח: פותח חיבור ואוסף הודעות
function client(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const inbox = [];
    ws.addEventListener("message", (e) => inbox.push(JSON.parse(e.data)));
    ws.addEventListener("open", () => resolve({ ws, inbox, send: (m) => ws.send(typeof m === "string" ? m : JSON.stringify(m)) }));
    ws.addEventListener("error", () => reject(new Error("החיבור נדחה")));
  });
}

test("בלי token תקין — החיבור נדחה; עם token — נפתח", async (t) => {
  const ws = await start(t);
  await assert.rejects(client(`${ws}/chat`), /נדחה/);
  await assert.rejects(client(`${ws}/chat?token=fake`), /נדחה/);
  const ok = await client(`${ws}/chat?token=t-dana`);
  ok.ws.close();
});
test("join ← joined; say ← לכל חברי החדר, כולל השולח", async (t) => {
  const ws = await start(t);
  const dana = await client(`${ws}/chat?token=t-dana`);
  const yossi = await client(`${ws}/chat?token=t-yossi`);
  t.after(() => { dana.ws.close(); yossi.ws.close(); });
  dana.send({ type: "join", room: "orders" });
  yossi.send({ type: "join", room: "orders" });
  await sleep(50);
  assert.deepEqual(dana.inbox, [{ type: "joined", room: "orders" }]);
  dana.send({ type: "say", text: "שלום" });
  await sleep(50);
  const msg = { type: "message", room: "orders", from: "dana", text: "שלום" };
  assert.deepEqual(dana.inbox.at(-1), msg);
  assert.deepEqual(yossi.inbox.at(-1), msg);
});
test("חדרים נפרדים, ו־from נקבע לפי ה־token", async (t) => {
  const ws = await start(t);
  const dana = await client(`${ws}/chat?token=t-dana`);
  const avi = await client(`${ws}/chat?token=t-avi`);
  t.after(() => { dana.ws.close(); avi.ws.close(); });
  dana.send({ type: "join", room: "a" });
  avi.send({ type: "join", room: "b" });
  await sleep(50);
  dana.send({ type: "say", text: "hi", from: "admin" });
  await sleep(50);
  assert.equal(avi.inbox.filter((m) => m.type === "message").length, 0, "avi בחדר אחר");
  assert.equal(dana.inbox.at(-1).from, "dana", "לא לסמוך על from מהלקוח");
});
test("שגיאות: JSON שבור, say לפני join, סוג לא מוכר — הודעת error, והחיבור נשאר", async (t) => {
  const ws = await start(t);
  const c = await client(`${ws}/chat?token=t-dana`);
  t.after(() => c.ws.close());
  c.send("{not json");
  c.send({ type: "say", text: "x" });
  c.send({ type: "dance" });
  await sleep(80);
  assert.equal(c.inbox.length, 3);
  for (const m of c.inbox) { assert.equal(m.type, "error"); assert.equal(typeof m.error, "string"); }
  assert.equal(c.ws.readyState, WebSocket.OPEN);
});
test("החלפת חדר — יוצאים מהקודם", async (t) => {
  const ws = await start(t);
  const dana = await client(`${ws}/chat?token=t-dana`);
  const yossi = await client(`${ws}/chat?token=t-yossi`);
  t.after(() => { dana.ws.close(); yossi.ws.close(); });
  yossi.send({ type: "join", room: "a" });
  yossi.send({ type: "join", room: "b" });
  dana.send({ type: "join", room: "a" });
  await sleep(50);
  dana.send({ type: "say", text: "anyone?" });
  await sleep(50);
  assert.equal(yossi.inbox.filter((m) => m.type === "message").length, 0);
});
