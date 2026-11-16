import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createAiMetrics } = await load(import.meta.url, "P29-E41.ts");

test("מונים ופורמט", () => {
  const m = createAiMetrics();
  m.record("claude-opus-5-5", "/ask", { input_tokens: 1000, output_tokens: 50, cache_read_input_tokens: null });
  m.record("claude-opus-5-5", "/ask", { input_tokens: 200, output_tokens: 10, cache_read_input_tokens: 900 });
  m.record("claude-haiku-5-5", "/tag", { input_tokens: 30, output_tokens: 2 });
  assert.equal(m.render(), [
    "# HELP ai_tokens_total Tokens used by AI calls",
    "# TYPE ai_tokens_total counter",
    'ai_tokens_total{model="claude-haiku-5-5",route="/tag",kind="input"} 30',
    'ai_tokens_total{model="claude-haiku-5-5",route="/tag",kind="output"} 2',
    'ai_tokens_total{model="claude-opus-5-5",route="/ask",kind="cache_read"} 900',
    'ai_tokens_total{model="claude-opus-5-5",route="/ask",kind="input"} 1200',
    'ai_tokens_total{model="claude-opus-5-5",route="/ask",kind="output"} 60',
  ].join("\n") + "\n");
});
test("ריק", () => {
  assert.equal(createAiMetrics().render(), "# HELP ai_tokens_total Tokens used by AI calls\n# TYPE ai_tokens_total counter\n");
});
