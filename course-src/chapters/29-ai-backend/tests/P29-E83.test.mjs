import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { sseApp } = await load(import.meta.url, "P29-E83.ts");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function start(t, streamText) {
  const { base, close } = await listen(sseApp(streamText));
  t.after(close);
  return base;
}

test("חלקים כ־JSON, ואז done", async (t) => {
  const got = [];
  const base = await start(t, async function* (q) {
    got.push(q);
    yield "שלום";
    yield "\n\nשורה \"שנייה\"";
  });
  const r = await fetch(`${base}/ask/stream?q=${encodeURIComponent("  מתי משלוחים? ")}`, { signal: AbortSignal.timeout(3000) });
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /^text\/event-stream/);
  assert.equal(r.headers.get("cache-control"), "no-cache");
  assert.equal(r.headers.get("x-accel-buffering"), "no");
  assert.equal(await r.text(), 'data: {"text":"שלום"}\n\ndata: {"text":"\\n\\nשורה \\"שנייה\\""}\n\nevent: done\ndata: {}\n\n');
  assert.deepEqual(got, ["מתי משלוחים?"], "השאלה אחרי trim");
});
test("400 בלי להתחיל stream", async (t) => {
  let called = 0;
  const base = await start(t, async function* () { called++; yield "x"; });
  for (const qs of ["", "?q=", "?q=%20%20", `?q=${"x".repeat(501)}`]) {
    const r = await fetch(`${base}/ask/stream${qs}`, { signal: AbortSignal.timeout(3000) });
    assert.equal(r.status, 400, qs.slice(0, 20));
    assert.match(r.headers.get("content-type"), /json/);
    assert.ok((await r.json()).error);
  }
  assert.equal(called, 0);
});
test("שגיאה באמצע ← event: error, בלי פרטים", async (t) => {
  const base = await start(t, async function* () {
    yield "חצי";
    throw new Error("org-42 overloaded internal");
  });
  const r = await fetch(`${base}/ask/stream?q=hi`, { signal: AbortSignal.timeout(3000) });
  assert.equal(r.status, 200);
  assert.equal(await r.text(), 'data: {"text":"חצי"}\n\nevent: error\ndata: {"error":"ai_failed"}\n\n');
});
test("הלקוח התנתק ← ה־signal מבוטל", async (t) => {
  let signal;
  const base = await start(t, async function* (q, s) {
    signal = s;
    for (let i = 0; i < 100 && !s.aborted; i++) {
      yield `chunk ${i} `;
      await wait(20);
    }
  });
  const ac = new AbortController();
  const r = await fetch(`${base}/ask/stream?q=hi`, { signal: ac.signal });
  const reader = r.body.getReader();
  await reader.read();
  assert.equal(signal?.aborted, false, "בזמן שהלקוח קורא — לא מבוטל");
  ac.abort();
  for (let i = 0; i < 50 && !signal.aborted; i++) await wait(10);
  assert.equal(signal.aborted, true, "אחרי ניתוק — signal.aborted");
});
