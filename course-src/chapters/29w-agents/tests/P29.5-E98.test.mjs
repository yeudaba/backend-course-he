import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "../../tools/load.mjs";

const { toOtelSpans } = await load(import.meta.url, "P29.5-E98.ts");
const TRACE = "4bf92f3577b34da6a3ce929d0e0e4736";
const sid = (id) => createHash("sha256").update(id).digest("hex").slice(0, 16);

test("המרה מלאה", () => {
  const out = toOtelSpans(TRACE, [
    { id: "conv", parentId: null, name: "agent.run", start: 1763290000000, end: 1763290004321 },
    { id: "m1", parentId: "conv", name: "model.call", start: 1763290000005, end: 1763290001200, attrs: { "gen_ai.request.model": "claude-opus-5-5", "gen_ai.usage.input_tokens": 3210, cost_usd: 0.0146, cached: false } },
  ]);
  assert.deepEqual(out, [
    { traceId: TRACE, spanId: sid("conv"), name: "agent.run", startTimeUnixNano: "1763290000000000000", endTimeUnixNano: "1763290004321000000", attributes: [] },
    {
      traceId: TRACE,
      spanId: sid("m1"),
      parentSpanId: sid("conv"),
      name: "model.call",
      startTimeUnixNano: "1763290000005000000",
      endTimeUnixNano: "1763290001200000000",
      attributes: [
        { key: "cached", value: { boolValue: false } },
        { key: "cost_usd", value: { doubleValue: 0.0146 } },
        { key: "gen_ai.request.model", value: { stringValue: "claude-opus-5-5" } },
        { key: "gen_ai.usage.input_tokens", value: { intValue: "3210" } },
      ],
    },
  ]);
  assert.equal("parentSpanId" in out[0], false, "בלי הורה — בלי השדה");
});
test("שגיאות", () => {
  for (const bad of ["4BF92F3577B34DA6A3CE929D0E0E4736", "abc", "", "4bf92f3577b34da6a3ce929d0e0e473g"]) assert.throws(() => toOtelSpans(bad, []), Error, bad);
  assert.throws(() => toOtelSpans(TRACE, [{ id: "x", parentId: "missing", name: "n", start: 1, end: 2 }]), Error);
  assert.deepEqual(toOtelSpans(TRACE, []), []);
});
