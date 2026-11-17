import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { reportApp, score } = await load(import.meta.url, "P28.5-E55.ts");

test("תוצאה נכונה", async (t) => {
  const values = [1, 2, 3, 999, 123456];
  const { base, close } = await listen(reportApp(values));
  t.after(close);
  const scores = values.map(score);
  const r = await (await fetch(`${base}/report`)).json();
  assert.deepEqual(r, { count: 5, sum: scores.reduce((a, b) => a + b, 0), max: Math.max(...scores) });
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { ok: true });
});
test("/health עונה באמצע דוח כבד", async (t) => {
  const values = Array.from({ length: 2_000_000 }, (_, i) => i);
  const { base, close } = await listen(reportApp(values));
  t.after(close);
  const t0 = performance.now();
  const report = fetch(`${base}/report`).then((r) => r.json());
  await new Promise((r) => setTimeout(r, 150));
  const h0 = performance.now();
  const h = await fetch(`${base}/health`);
  const healthMs = performance.now() - h0;
  assert.equal(h.status, 200);
  const r = await report;
  const reportMs = performance.now() - t0;
  assert.equal(r.count, 2_000_000);
  assert.ok(reportMs > healthMs, "הדוח צריך להיות עדיין באמצע כשה־health נשלח");
  assert.ok(healthMs < 150, `/health ענה אחרי ${Math.round(healthMs)}ms — ה־event loop חסום (הדוח לקח ${Math.round(reportMs)}ms)`);
});
