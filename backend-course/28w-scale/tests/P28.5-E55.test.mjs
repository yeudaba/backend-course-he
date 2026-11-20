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
  const values = Array.from({ length: 600_000 }, (_, i) => i);
  const { base, close } = await listen(reportApp(values));
  t.after(close);
  // מודדים לפי סדר ולא לפי זמן קבוע: אם ה־event loop חסום, /health יענה רק אחרי שהדוח נגמר
  let reportDone = 0;
  const t0 = performance.now();
  const report = fetch(`${base}/report`).then(async (r) => { const body = await r.json(); reportDone = performance.now(); return body; });
  await new Promise((r) => setTimeout(r, 150));
  const h0 = performance.now();
  const h = await fetch(`${base}/health`);
  const healthDone = performance.now();
  assert.equal(h.status, 200);
  const r = await report;
  assert.equal(r.count, 600_000);
  const reportMs = reportDone - t0;
  assert.ok(reportMs > 150, `הדוח לקח רק ${Math.round(reportMs)}ms — צריך שיהיה עדיין באמצע כשה־health נשלח`);
  assert.ok(healthDone < reportDone, `/health ענה רק אחרי שהדוח הסתיים (${Math.round(healthDone - h0)}ms) — ה־event loop חסום. חלק את העבודה למנות עם await של setImmediate ביניהן`);
});
