import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { costUsd, PRICES } = await load(import.meta.url, "P29-E08.ts");

test("קלט ופלט", () => {
  assert.equal(costUsd("claude-opus-5-5", { input_tokens: 1_000_000, output_tokens: 0 }), 4);
  assert.equal(costUsd("claude-opus-5-5", { input_tokens: 2000, output_tokens: 500 }), 0.018);
  assert.equal(costUsd("claude-haiku-5-5", { input_tokens: 2000, output_tokens: 500 }), 0.00045);
});
test("cache: כתיבה וקריאה נספרות בנפרד", () => {
  const u = { input_tokens: 50, output_tokens: 300, cache_creation_input_tokens: 10_000, cache_read_input_tokens: 0 };
  assert.equal(costUsd("claude-opus-5-5", u), 0.0562);
  assert.equal(costUsd("claude-opus-5-5", { ...u, cache_creation_input_tokens: 0, cache_read_input_tokens: 10_000 }), 0.0082);
  assert.equal(costUsd("claude-sonnet-5-5", { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: null, cache_read_input_tokens: null }), 0.000012);
});
test("מודל לא מוכר ← שגיאה; הטבלה כוללת שלושה מודלים", () => {
  assert.throws(() => costUsd("gpt-x", { input_tokens: 1, output_tokens: 1 }));
  assert.deepEqual(Object.keys(PRICES).sort(), ["claude-haiku-5-5", "claude-opus-5-5", "claude-sonnet-5-5"]);
});
