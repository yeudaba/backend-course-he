import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load } from "../../tools/load.mjs";

const { runLoad } = await load(import.meta.url, "P28.5-E08.ts");

async function server(t, delayMs) {
  let now = 0;
  let peak = 0;
  const s = http.createServer((req, res) => {
    peak = Math.max(peak, ++now);
    setTimeout(() => {
      now--;
      res.statusCode = req.url === "/fail" ? 500 : 200;
      res.end("ok");
    }, delayMs);
  });
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => s.close(r)));
  return { url: `http://127.0.0.1:${s.address().port}`, peak: () => peak };
}

test("concurrency קבוע: 50 בקשות של 30ms, 5 במקביל ← כ־300ms", async (t) => {
  const s = await server(t, 30);
  const r = await runLoad(async () => {
    const res = await fetch(s.url);
    await res.text();
  }, { concurrency: 5, total: 50 });
  assert.equal(r.total, 50);
  assert.equal(r.errors, 0);
  assert.equal(s.peak(), 5, "בדיוק 5 בקשות בו־זמנית בשרת");
  assert.ok(r.durationMs >= 280 && r.durationMs < 1200, `durationMs ${r.durationMs}`);
  assert.ok(r.rps > 40 && r.rps <= 180, `rps ${r.rps}`);
  assert.ok(r.latency.p50 >= 29 && r.latency.p50 < 200, `p50 ${r.latency.p50}`);
  assert.ok(r.latency.p50 <= r.latency.p95 && r.latency.p95 <= r.latency.p99 && r.latency.p99 <= r.latency.max);
});
test("שגיאות נספרות, והבדיקה ממשיכה", async (t) => {
  let i = 0;
  const r = await runLoad(async () => {
    if (++i % 4 === 0) throw new Error("boom");
  }, { concurrency: 3, total: 20 });
  assert.equal(r.total, 20);
  assert.equal(r.errors, 5);
});
test("total קטן מ־concurrency", async () => {
  let calls = 0;
  const r = await runLoad(async () => void calls++, { concurrency: 10, total: 3 });
  assert.equal(calls, 3);
  assert.equal(r.total, 3);
});
