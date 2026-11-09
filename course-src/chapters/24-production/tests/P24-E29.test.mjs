import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { parseTraceparent, tracing, outgoingHeaders } = await load(import.meta.url, "P24-E29.ts");
const T = "4bf92f3577b34da6a3ce929d0e0e4736";
const P = "00f067aa0ba902b7";

test("parseTraceparent: תקין", () => {
  assert.deepEqual(parseTraceparent(`00-${T}-${P}-01`), { traceId: T, parentId: P, sampled: true });
  assert.deepEqual(parseTraceparent(`00-${T}-${P}-00`), { traceId: T, parentId: P, sampled: false });
});
test("parseTraceparent: לא תקין ← null", () => {
  for (const bad of [undefined, "", "garbage", `01-${T}-${P}-01`, `00-${T.toUpperCase()}-${P}-01`, `00-${T}-${P}`, `00-${"0".repeat(32)}-${P}-01`, `00-${T}-${"0".repeat(16)}-01`, `00-${T}a-${P}-01`]) {
    assert.equal(parseTraceparent(bad), null, `${bad}`);
  }
});
async function start(t) {
  const spans = [];
  const seen = [];
  const down = express();
  down.get("/stock", (req, res) => { seen.push(req.get("traceparent")); res.json({ ok: true }); });
  const d = await listen(down);
  t.after(d.close);
  let n = 0;
  const clock = { t: 0 };
  const app = express();
  app.use(tracing({ onSpan: (s) => spans.push(s), now: () => clock.t, randomHex: (b) => String(++n).padStart(b * 2, "a") }));
  app.get("/orders/:id", async (req, res) => {
    await new Promise((r) => setTimeout(r, 5)); // אחרי await — עדיין באותו הקשר
    clock.t += 40;
    const r = await fetch(d.base + "/stock", { headers: outgoingHeaders() });
    res.json({ stock: (await r.json()).ok });
  });
  const { base, close } = await listen(app);
  t.after(close);
  return { spans, seen, call: api(base) };
}
const settle = () => new Promise((r) => setTimeout(r, 30));

test("ממשיך trace שהגיע, ומעביר את ה־span שלו הלאה", async (t) => {
  const { spans, seen, call } = await start(t);
  const r = await call("GET", "/orders/9", undefined, { headers: { traceparent: `00-${T}-${P}-01` } });
  await settle();
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-trace-id"), T);
  assert.equal(spans.length, 1);
  const s = spans[0];
  assert.equal(s.traceId, T);
  assert.equal(s.parentSpanId, P, "ההורה — מה שהגיע ב־traceparent");
  assert.match(s.spanId, /^[0-9a-f]{16}$/);
  assert.notEqual(s.spanId, P, "span חדש, לא של ההורה");
  assert.equal(s.name, "GET /orders/:id");
  assert.equal(s.status, 200);
  assert.equal(s.durationMs, 40);
  assert.deepEqual(seen, [`00-${T}-${s.spanId}-01`], "השירות הבא מקבל את אותו trace, וה־span שלנו כהורה");
});
test("בלי traceparent (או לא תקין) — trace חדש בלי הורה", async (t) => {
  const { spans, call } = await start(t);
  await call("GET", "/orders/1");
  await call("GET", "/orders/2", undefined, { headers: { traceparent: "nonsense" } });
  await settle();
  assert.equal(spans.length, 2);
  for (const s of spans) {
    assert.equal(s.parentSpanId, null);
    assert.match(s.traceId, /^[0-9a-f]{32}$/);
  }
  assert.notEqual(spans[0].traceId, spans[1].traceId);
});
test("outgoingHeaders מחוץ לבקשה ← {}", () => {
  assert.deepEqual(outgoingHeaders(), {});
});
test("שתי בקשות במקביל — כל אחת עם ההקשר שלה", async (t) => {
  const { spans, seen, call } = await start(t);
  const T2 = "a".repeat(31) + "b";
  await Promise.all([
    call("GET", "/orders/1", undefined, { headers: { traceparent: `00-${T}-${P}-01` } }),
    call("GET", "/orders/2", undefined, { headers: { traceparent: `00-${T2}-${P}-01` } }),
  ]);
  await settle();
  assert.equal(seen.length, 2);
  for (const s of spans) assert.ok(seen.includes(`00-${s.traceId}-${s.spanId}-01`), "כל בקשה יוצאת נושאת את ה־trace שלה");
});
