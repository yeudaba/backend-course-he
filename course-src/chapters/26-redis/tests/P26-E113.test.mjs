import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { WebSocketServer, WebSocket as WsClient } from "ws";
import { load } from "../../tools/load.mjs";

const { attachHeartbeat } = await load(import.meta.url, "P26-E113.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const open = (ws) => new Promise((r, j) => { ws.once("open", r); ws.once("error", j); });

test("לקוח שעונה pong נשאר; לקוח מת מנותק", async (t) => {
  const server = http.createServer();
  const wss = new WebSocketServer({ server });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `ws://127.0.0.1:${server.address().port}`;
  let stop;
  t.after(async () => { stop?.(); for (const c of wss.clients) c.terminate(); wss.close(); await new Promise((r) => server.close(r)); });
  stop = attachHeartbeat(wss, 80);
  assert.equal(typeof stop, "function", "מחזיר פונקציית עצירה");

  const good = new WsClient(url); // עונה pong לבד
  const dead = new WsClient(url, { autoPong: false }); // "הטלפון נכבה": לא עונה
  await Promise.all([open(good), open(dead)]);
  let pingsToGood = 0;
  good.on("ping", () => pingsToGood++);
  const deadClosed = new Promise((r) => dead.once("close", r));
  await Promise.race([deadClosed, sleep(1000)]);
  assert.equal(dead.readyState, WsClient.CLOSED, "הלקוח שלא ענה pong נותק");
  await sleep(200);
  assert.equal(good.readyState, WsClient.OPEN, "הלקוח שעונה נשאר מחובר");
  assert.ok(pingsToGood >= 2, `הלקוח הטוב קיבל ${pingsToGood} pings`);
  assert.equal(wss.clients.size, 1);
  stop();
  const before = pingsToGood;
  await sleep(250);
  assert.equal(pingsToGood, before, "אחרי stop() אין יותר pings");
  good.close();
});
