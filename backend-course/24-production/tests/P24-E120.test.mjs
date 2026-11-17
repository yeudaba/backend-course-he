import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { exportsOf } from "./_ts.mjs";

async function make() {
  const { createTracer } = await exportsOf(import.meta.url, "P24-E120.ts", ["createTracer"]);
  const spans = [];
  let t = 1000;
  let n = 0;
  const tracer = createTracer({
    onSpan: (s) => spans.push(s),
    now: () => t,
    randomHex: (bytes) => `${bytes === 16 ? "trace" : "span"}${++n}`,
  });
  return { tracer, spans, advance: (ms) => { t += ms; } };
}

test("trace חדש, ילד עם הורה, ומשך", async () => {
  const { tracer, spans, advance } = await make();
  const result = await tracer.withSpan("GET /orders/:id", async () => {
    advance(5);
    const rows = await tracer.withSpan("db: SELECT", async () => {
      await sleep(5);
      advance(30);
      return ["row"];
    });
    advance(10);
    return rows.length;
  });
  assert.equal(result, 1);
  assert.deepEqual(spans, [
    { traceId: "trace1", spanId: "span3", parentSpanId: "span2", name: "db: SELECT", durationMs: 30, error: false },
    { traceId: "trace1", spanId: "span2", parentSpanId: null, name: "GET /orders/:id", durationMs: 45, error: false },
  ]);
});
test("במקביל — כל ילד עם ההורה שלו, ושני traces לא מתערבבים", async () => {
  const { tracer, spans } = await make();
  const request = (name, ms) => tracer.withSpan(name, async () => {
    await Promise.all([
      tracer.withSpan(`${name}/a`, async () => { await sleep(ms); }),
      tracer.withSpan(`${name}/b`, async () => { await sleep(ms / 2); }),
    ]);
    return tracer.currentTraceId();
  });
  const [t1, t2] = await Promise.all([request("r1", 20), request("r2", 10)]);
  assert.notEqual(t1, t2);
  const byName = Object.fromEntries(spans.map((s) => [s.name, s]));
  for (const r of ["r1", "r2"]) {
    for (const c of ["a", "b"]) {
      assert.equal(byName[`${r}/${c}`].parentSpanId, byName[r].spanId, `${r}/${c} תלוי על ${r}`);
      assert.equal(byName[`${r}/${c}`].traceId, byName[r].traceId);
    }
  }
  assert.equal(tracer.currentTraceId(), undefined, "מחוץ ל־span");
});
test("שגיאה — span עם error, והשגיאה עוברת הלאה", async () => {
  const { tracer, spans } = await make();
  await assert.rejects(tracer.withSpan("outer", () => tracer.withSpan("inner", async () => { throw new Error("timeout"); })), { message: "timeout" });
  assert.deepEqual(spans.map((s) => [s.name, s.error]), [["inner", true], ["outer", true]]);
  await tracer.withSpan("after", async () => {});
  assert.equal(spans.at(-1).parentSpanId, null, "אחרי השגיאה — שוב מחוץ לכל span");
});
test("שני tracers — לא חולקים הקשר", async () => {
  const a = await make();
  const b = await make();
  await a.tracer.withSpan("A", async () => {
    await b.tracer.withSpan("B", async () => {});
  });
  assert.equal(b.spans[0].parentSpanId, null);
});
