import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E56.ts";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TIMEOUT = { error: { code: "TIMEOUT", message: "הבקשה לקחה יותר מדי זמן" } };
async function start(t) {
  const { withTimeout } = await exportsOf(import.meta.url, FILE, ["withTimeout"]);
  const state = { lateErrors: 0, finished: 0 };
  const app = express();
  app.get("/fast", withTimeout(async (req, res) => {
    await sleep(10);
    res.status(201).json({ ok: true });
    state.finished++;
  }, 100));
  app.get("/slow", withTimeout(async (req, res) => {
    await sleep(250);
    if (!res.headersSent) res.json({ ok: true });
    state.finished++;
  }, 80));
  app.get("/throws", withTimeout(async () => {
    await sleep(5);
    throw new Error("bad");
  }, 100));
  app.get("/late-throw", withTimeout(async () => {
    await sleep(200);
    state.lateErrors++;
    throw new Error("late");
  }, 50));
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });
  const { base, close } = await listen(app);
  t.after(close);
  return { call: api(base), state };
}
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("מסיים בזמן ← התשובה שלו", async (t) => {
  const { call } = await start(t);
  const r = await call("GET", "/fast");
  assert.deepEqual([r.status, r.body], [201, { ok: true }]);
});
test("איטי ← 503 מהר, וה־handler מסיים בשקט", async (t) => {
  const { call, state } = await start(t);
  const startAt = Date.now();
  const r = await call("GET", "/slow");
  const ms = Date.now() - startAt;
  assert.deepEqual([r.status, r.body], [503, TIMEOUT]);
  assert.ok(ms < 200, `לקח ${ms}ms — התשובה צריכה לצאת אחרי ms, לא לחכות ל־handler`);
  await sleep(250);
  assert.equal(state.finished, 1, "ה־handler המקורי ממשיך ומסיים");
});
test("זרק ← next(err)", async (t) => {
  const { call } = await start(t);
  const r = await call("GET", "/throws");
  assert.deepEqual([r.status, r.body], [500, { error: "bad" }]);
});
test("זרק אחרי ה־timeout ← לא מפיל ולא עונה פעמיים", async (t) => {
  const { call, state } = await start(t);
  const r = await call("GET", "/late-throw");
  assert.deepEqual([r.status, r.body], [503, TIMEOUT]);
  await sleep(250);
  assert.equal(state.lateErrors, 1);
  const again = await call("GET", "/fast");
  assert.equal(again.status, 201, "השרת עדיין חי");
});
test("הטיימר מבוטל כשה־handler סיים", async (t) => {
  const { withTimeout } = await exportsOf(import.meta.url, FILE, ["withTimeout"]);
  const realSet = globalThis.setTimeout;
  const realClear = globalThis.clearTimeout;
  const live = new Set();
  globalThis.setTimeout = (fn, ms, ...a) => { const id = realSet(() => { live.delete(id); fn(...a); }, ms); live.add(id); return id; };
  globalThis.clearTimeout = (id) => { live.delete(id); realClear(id); };
  t.after(() => { globalThis.setTimeout = realSet; globalThis.clearTimeout = realClear; });
  const h = withTimeout(async (req, res) => { res.headersSent = true; }, 5000);
  const res = { headersSent: false, status() { return this; }, json() { return this; } };
  await h({}, res, () => {});
  assert.equal(live.size, 0, "קרא ל־clearTimeout אחרי שה־handler סיים");
});
