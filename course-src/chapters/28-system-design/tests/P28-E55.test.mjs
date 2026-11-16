import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { timeout } = await load(import.meta.url, "P28-E55.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start(t) {
  const seen = [];
  const app = express();
  app.use(timeout(80));
  app.get("/fast", (req, res) => res.json({ ok: true }));
  app.get("/slow", async (req, res) => {
    await sleep(250);
    seen.push(req.timedOut === true);
    if (!res.headersSent) res.json({ ok: "late" });
  });
  const { base, close } = await listen(app);
  t.after(close);
  return { base, seen };
}

test("תשובה מהירה עוברת", async (t) => {
  const { base } = await start(t);
  const r = await fetch(`${base}/fast`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
});
test("איטית ← 503 עם Retry-After, ו־req.timedOut", async (t) => {
  const { base, seen } = await start(t);
  const t0 = performance.now();
  const r = await fetch(`${base}/slow`);
  const took = performance.now() - t0;
  assert.equal(r.status, 503);
  assert.deepEqual(await r.json(), { error: "timeout" });
  assert.equal(r.headers.get("retry-after"), "1");
  assert.ok(took < 220, `התשובה הגיעה אחרי ${Math.round(took)}ms — היא הייתה צריכה להגיע אחרי כ־80ms`);
  await sleep(250);
  assert.deepEqual(seen, [true], "ה־handler צריך לראות req.timedOut === true");
});
test("הטיימר מתבטל כשהתשובה נשלחה", async (t) => {
  const { base } = await start(t);
  const before = process.getActiveResourcesInfo().filter((x) => x === "Timeout").length;
  await Promise.all(Array.from({ length: 20 }, () => fetch(`${base}/fast`).then((r) => r.text())));
  await sleep(10);
  const after = process.getActiveResourcesInfo().filter((x) => x === "Timeout").length;
  assert.ok(after - before < 5, `נשארו ${after - before} טיימרים פתוחים אחרי 20 תשובות מהירות — clearTimeout ב־"finish"?`);
});
