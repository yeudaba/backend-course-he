import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { sloMetrics } = await load(import.meta.url, "P28.5-E40.ts");

async function start(t, durations) {
  let clock = 0;
  const now = () => clock;
  const m = sloMetrics({ buckets: [50, 100, 300, 1000], latencyMs: 300, target: 0.9, now });
  const app = express();
  app.use(m.middleware);
  app.use(m.router);
  app.get("/work/:ms/:status", (req, res) => {
    clock += Number(req.params.ms);
    res.status(Number(req.params.status)).json({ ok: true });
  });
  const { base, close } = await listen(app);
  t.after(close);
  for (const [ms, status] of durations) await fetch(`${base}/work/${ms}/${status}`).then((r) => r.text());
  return (await fetch(`${base}/slo`)).json();
}

test("דליים, good ו־ok", async (t) => {
  const r = await start(t, [[10, 200], [50, 200], [80, 200], [300, 200], [301, 200], [2000, 200], [20, 500], [40, 404], [90, 200], [100, 200]]);
  assert.deepEqual(r, { total: 10, errors: 1, buckets: [4, 3, 1, 1, 1], good: 7, ok: false });
});
test("עומד ביעד; /slo לא נספר", async (t) => {
  const r = await start(t, Array.from({ length: 10 }, (_, i) => [i === 0 ? 5000 : 20, 200]));
  assert.deepEqual(r, { total: 10, errors: 0, buckets: [9, 0, 0, 0, 1], good: 9, ok: true });
});
test("בלי בקשות; latencyMs שאינו גבול", async (t) => {
  const r = await start(t, []);
  assert.deepEqual(r, { total: 0, errors: 0, buckets: [0, 0, 0, 0, 0], good: 0, ok: true });
  assert.throws(() => sloMetrics({ buckets: [50, 100], latencyMs: 80, target: 0.9 }));
});
