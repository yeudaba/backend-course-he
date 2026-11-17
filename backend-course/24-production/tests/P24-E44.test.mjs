import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

async function start(t, { withId = true } = {}) {
  const { errorHandler } = await exportsOf(import.meta.url, "P24-E44.ts", ["errorHandler"]);
  const logs = [];
  const app = express();
  if (withId) app.use((req, res, next) => { res.locals.requestId = "req-77"; next(); });
  app.use(express.json());
  app.post("/echo", (req, res) => res.json(req.body));
  app.get("/boom", () => { throw new Error("password authentication failed for user \"admin\""); });
  app.get("/teapot", () => { throw Object.assign(new Error("short and stout"), { status: 418 }); });
  app.get("/weird", () => { throw Object.assign(new Error("bad gateway"), { status: 502 }); });
  app.get("/partial", (req, res, next) => { res.writeHead(200, { "content-type": "text/plain" }); res.write("part"); next(new Error("late")); });
  app.use(errorHandler((level, msg, fields) => logs.push({ level, msg, fields })));
  const { base, close } = await listen(app);
  t.after(close);
  return { call: api(base), logs, base };
}

test("שגיאה לא צפויה ← 500 בלי לחשוף את ההודעה", async (t) => {
  const { call, logs } = await start(t);
  const r = await call("GET", "/boom");
  assert.equal(r.status, 500);
  assert.deepEqual(r.body, { error: { code: "INTERNAL", message: "שגיאה בשרת", requestId: "req-77" } });
  assert.ok(!JSON.stringify(r.body).includes("admin"), "ההודעה המקורית לא נשלחת ללקוח");
  assert.equal(logs.length, 1);
  assert.equal(logs[0].level, "error");
  assert.equal(logs[0].msg, "unhandled error");
  assert.equal(logs[0].fields.requestId, "req-77");
  assert.equal(logs[0].fields.err.message, 'password authentication failed for user "admin"');
  assert.equal(logs[0].fields.err.name, "Error");
  assert.match(String(logs[0].fields.err.stack), /at /, "ה־stack בלוג");
});
test("JSON שבור ← 400 ו־warn", async (t) => {
  const { call, logs } = await start(t);
  const r = await call("POST", "/echo", undefined, { raw: '{"title": ' });
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: { code: "BAD_REQUEST", message: "בקשה לא תקינה", requestId: "req-77" } });
  assert.equal(logs.length, 1);
  assert.equal(logs[0].level, "warn");
  assert.equal(logs[0].msg, "client error");
  assert.equal(logs[0].fields.status, 400);
  assert.equal(logs[0].fields.requestId, "req-77");
  assert.equal(typeof logs[0].fields.message, "string");
});
test("status אחר בטווח 4xx נשמר; 5xx מהשגיאה ← 500", async (t) => {
  const { call, logs } = await start(t);
  const a = await call("GET", "/teapot");
  assert.equal(a.status, 418);
  assert.equal(a.body.error.code, "BAD_REQUEST");
  const b = await call("GET", "/weird");
  assert.equal(b.status, 500, "status 502 על השגיאה הוא לא 'אשמת הלקוח'");
  assert.equal(b.body.error.code, "INTERNAL");
  assert.deepEqual(logs.map((l) => l.level), ["warn", "error"]);
});
test("בלי requestId ← null", async (t) => {
  const { call } = await start(t, { withId: false });
  const r = await call("GET", "/boom");
  assert.equal(r.body.error.requestId, null);
});
test("תשובה שכבר התחילה ← next(err)", async (t) => {
  const { base, logs } = await start(t);
  const res = await fetch(base + "/partial", { signal: AbortSignal.timeout(3000) }).catch((e) => e);
  if (!(res instanceof Error)) {
    assert.equal(res.status, 200, "לא מנסים לשנות status אחרי שנשלח");
    await res.text().catch(() => {});
  }
  assert.equal(logs.length, 0, "לא כותבים ולא עונים — Express מטפל בזה");
});
