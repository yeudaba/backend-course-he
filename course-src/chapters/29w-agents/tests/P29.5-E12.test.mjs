import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

const { createTracer } = await load(import.meta.url, "P29.5-E12.ts");

test("span לכל קריאה למודל: טוקנים, cache ועלות", async () => {
  const tr = createTracer();
  const { client } = fakeClaude((b, i) =>
    i === 0 ? message([toolUse("x", {})], { stop_reason: "tool_use", usage: { input_tokens: 10000, output_tokens: 500, cache_read_input_tokens: 40000 } }) : message("ok", { usage: { input_tokens: 2000, output_tokens: 100 } }),
  );
  const c = tr.wrapClient(client);
  await c.messages.create({ model: "claude-opus-5-5", max_tokens: 100, messages: [{ role: "user", content: "a" }] });
  await c.messages.create({ model: "claude-opus-5-5", max_tokens: 100, messages: [{ role: "user", content: "b" }] });
  const m = tr.spans.filter((s) => s.kind === "model");
  assert.deepEqual(m.map((s) => [s.step, s.stopReason, s.inputTokens, s.outputTokens, s.cacheReadTokens, s.costUsd]), [
    [1, "tool_use", 10000, 500, 40000, 0.058], // 10000×4 + 500×20 + 40000×0.2 = 58,000 / 1e6
    [2, "end_turn", 2000, 100, 0, 0.01],
  ]);
  assert.ok(m.every((s) => typeof s.ms === "number" && s.model === "claude-opus-5-5"));
});
test("tools: זמן ושגיאות; summary", async () => {
  const tr = createTracer();
  const ok = tr.wrapTool("get_order", async (i) => `order ${i.id}`);
  const bad = tr.wrapTool("refund", async () => {
    throw new Error("declined");
  });
  assert.equal(await ok({ id: 3 }), "order 3");
  await assert.rejects(bad({}), /declined/, "השגיאה ממשיכה הלאה — ה־tracer רק מתעד");
  const { client } = fakeClaude(() => message("hi", { usage: { input_tokens: 1000, output_tokens: 1000 } }));
  await tr.wrapClient(client).messages.create({ model: "claude-sonnet-5-5", max_tokens: 10, messages: [{ role: "user", content: "x" }] });
  assert.deepEqual(tr.summary(), { steps: 1, toolCalls: 2, toolErrors: 1, inputTokens: 1000, outputTokens: 1000, costUsd: 0.012 });
});
test("ה־client העטוף עדיין client", async () => {
  const tr = createTracer();
  const { client } = fakeClaude(() => message("hi"));
  const c = tr.wrapClient(client);
  assert.equal(typeof c.models?.list, "function", "שאר ה־API לא נפגע");
  await assert.rejects(c.messages.create({ model: "gpt-x", max_tokens: 1, messages: [{ role: "user", content: "x" }] }), /gpt-x/, "מודל בלי מחיר ← שגיאה");
});
