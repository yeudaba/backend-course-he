import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { requestLogger } = await load(import.meta.url, "P24-E09.ts");
async function start(t, opts = {}) {
  const entries = [];
  let tick = 1000;
  const app = express();
  app.use((req, res, next) => { if (req.get("x-id")) res.locals.requestId = req.get("x-id"); next(); });
  app.use(requestLogger({ log: (level, msg, fields) => entries.push({ level, msg, ...fields }), now: () => (tick += 12.4), ...opts }));
  app.get("/health", (req, res) => res.json({ ok: true }));
  app.get("/tasks", (req, res) => res.json([]));
  app.post("/tasks", (req, res) => res.status(422).json({ error: "x" }));
  app.get("/boom", () => { throw new Error("x"); });
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  const settle = () => new Promise((r) => setTimeout(r, 20)); // 'finish' יכול לרוץ רגע אחרי שהלקוח קיבל תשובה
  return { call, entries, settle };
}

test("שורה לכל בקשה, עם השדות", async (t) => {
  const { call, entries, settle } = await start(t);
  await call("GET", "/tasks?token=secret&page=2", undefined, { headers: { "x-id": "r-1" } });
  await settle();
  assert.deepEqual(entries, [{ level: "info", msg: "request", method: "GET", path: "/tasks", status: 200, durationMs: 12, requestId: "r-1" }]);
});
test("רמה לפי status", async (t) => {
  const { call, entries, settle } = await start(t);
  await call("POST", "/tasks", {});
  await call("GET", "/boom");
  await call("GET", "/nope");
  await settle();
  assert.deepEqual(entries.map((e) => [e.status, e.level]), [[422, "warn"], [500, "error"], [404, "warn"]]);
  assert.ok(!("requestId" in entries[0]), "בלי res.locals.requestId — בלי השדה");
});
test("שעון: now() בתחילה ובסוף", async (t) => {
  const { call, entries, settle } = await start(t);
  await call("GET", "/tasks");
  await settle();
  assert.equal(entries[0].durationMs, 12, "12.4 מעוגל ל־12");
});
test("skip — רק כשהצליח", async (t) => {
  const { call, entries, settle } = await start(t, { skip: ["/health", "/boom"] });
  await call("GET", "/health");
  await call("GET", "/health?x=1");
  await call("GET", "/boom");
  await settle();
  assert.deepEqual(entries.map((e) => e.path), ["/boom"], "/health מוצלח לא נכתב; /boom עם 500 — כן");
});
