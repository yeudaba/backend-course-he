import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import { load } from "../../tools/load.mjs";

const { gracefulShutdown } = await load(import.meta.url, "P24-E19.ts");

async function start(t, opts) {
  const events = [];
  const app = express();
  let g;
  app.get("/ready", (req, res) => res.status(g.isShuttingDown() ? 503 : 200).json({}));
  app.get("/fast", (req, res) => res.json({ ok: true }));
  app.get("/slow", (req, res) => setTimeout(() => { events.push("slow done"); res.json({ ok: true }); }, 300));
  app.get("/hang", () => {});
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => server.closeAllConnections());
  g = gracefulShutdown(server, { onClose: async () => { events.push("onClose"); }, ...opts });
  const base = `http://127.0.0.1:${server.address().port}`;
  // agent עם keep-alive — כמו דפדפן או load balancer
  const agent = new http.Agent({ keepAlive: true });
  t.after(() => agent.destroy());
  const get = (path) => new Promise((resolve, reject) => {
    http.get(base + path, { agent }, (res) => { res.resume(); res.on("end", () => resolve(res.statusCode)); }).on("error", reject);
  });
  return { g, get, events, server, base };
}

test("בקשה שבאמצע — מסתיימת, ורק אז onClose", async (t) => {
  const { g, get, events } = await start(t);
  const slow = get("/slow");
  await new Promise((r) => setTimeout(r, 50));
  const done = g.shutdown();
  assert.equal(g.isShuttingDown(), true);
  assert.equal(await slow, 200, "הבקשה האיטית קיבלה תשובה");
  assert.deepEqual(await done, { forced: false });
  assert.deepEqual(events, ["slow done", "onClose"], "onClose אחרי שהבקשה הסתיימה");
});
test("חיבורי keep-alive פנויים לא מעכבים", async (t) => {
  const { g, get } = await start(t);
  assert.equal(await get("/fast"), 200); // עכשיו יש חיבור keep-alive פתוח ופנוי
  const started = Date.now();
  assert.deepEqual(await g.shutdown(), { forced: false });
  assert.ok(Date.now() - started < 1000, `נסגר מהר (${Date.now() - started}ms) — לא חיכה ל־keep-alive`);
});
test("חיבורים חדשים — נדחים", async (t) => {
  const { g, base } = await start(t);
  await g.shutdown();
  await assert.rejects(fetch(base + "/fast"), "השרת לא מקבל חיבורים");
});
test("timeout ← סגירה בכוח", async (t) => {
  const { g, get, events } = await start(t, { timeoutMs: 150 });
  const hang = get("/hang").catch((e) => e.code);
  await new Promise((r) => setTimeout(r, 30));
  const started = Date.now();
  assert.deepEqual(await g.shutdown(), { forced: true });
  const waited = Date.now() - started;
  assert.ok(waited >= 140 && waited < 1000, `חיכה ~150ms (${waited})`);
  assert.equal(await hang, "ECONNRESET", "הבקשה התקועה נותקה");
  assert.deepEqual(events, ["onClose"]);
});
test("shutdown פעמיים — פעם אחת", async (t) => {
  const { g, events } = await start(t);
  const [a, b] = await Promise.all([g.shutdown(), g.shutdown()]);
  assert.deepEqual(a, b);
  assert.deepEqual(events, ["onClose"]);
});
test("readiness בזמן כיבוי", async (t) => {
  const { g, get } = await start(t);
  assert.equal(await get("/ready"), 200);
  const slow = get("/slow");
  await new Promise((r) => setTimeout(r, 30));
  const done = g.shutdown();
  assert.equal(g.isShuttingDown(), true, "load balancer שואל /ready ומפסיק לשלוח");
  await slow;
  await done;
});
