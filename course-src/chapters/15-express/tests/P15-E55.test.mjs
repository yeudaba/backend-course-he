import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E55.ts";
async function start(t) {
  const { createMetrics } = await exportsOf(import.meta.url, FILE, ["createMetrics"]);
  let clock = 1000;
  const metrics = createMetrics(() => clock);
  const app = express();
  app.use(metrics.middleware);
  // כל route "לוקח" זמן לפי ?ms — מזיזים את השעון המזויף לפני התשובה
  app.all("/*path", (req, res) => {
    clock += Number(req.query.ms ?? 0);
    res.status(Number(req.query.status ?? 200)).end();
  });
  const { base, close } = await listen(app);
  t.after(close);
  const hit = async (method, path) => {
    await (await fetch(base + path, { method })).arrayBuffer();
    await new Promise((r) => setTimeout(r, 5));
  };
  return { metrics, hit };
}
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("לפני בקשות", async (t) => {
  const { metrics } = await start(t);
  assert.deepEqual(metrics.snapshot(), { total: 0, byStatus: {}, avgMs: 0, maxMs: 0, slowest: null });
});
test("ספירה, ממוצע ואיטית", async (t) => {
  const { metrics, hit } = await start(t);
  await hit("GET", "/a?ms=10");
  await hit("POST", "/b?ms=35&status=201");
  await hit("GET", "/c?ms=35&status=404");
  await hit("GET", "/d?ms=1&status=503");
  assert.deepEqual(metrics.snapshot(), {
    total: 4,
    byStatus: { "2xx": 2, "4xx": 1, "5xx": 1 },
    avgMs: 20,
    maxMs: 35,
    slowest: "POST /b?ms=35&status=201",
  }, "avg = (10+35+35+1)/4 = 20.25 ← 20; בשוויון — הראשונה");
});
test("snapshot הוא עותק", async (t) => {
  const { metrics, hit } = await start(t);
  await hit("GET", "/a?ms=3");
  const s = metrics.snapshot();
  s.byStatus["2xx"] = 999;
  s.total = 999;
  assert.deepEqual(metrics.snapshot().byStatus, { "2xx": 1 });
  assert.equal(metrics.snapshot().total, 1);
  assert.notEqual(metrics.snapshot(), metrics.snapshot());
});
test("כל createMetrics נפרד", async (t) => {
  const a = await start(t);
  const b = await start(t);
  await a.hit("GET", "/x?ms=7");
  assert.equal(b.metrics.snapshot().total, 0);
  assert.equal(a.metrics.snapshot().avgMs, 7);
});
