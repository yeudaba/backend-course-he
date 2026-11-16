import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { message, thinking } from "./_claude.mjs";

const { callLog } = await load(import.meta.url, "P29-E34.ts");

test("שדות, בלי טקסט", () => {
  const r = message([thinking(), "סודי: הכתובת של דנה", " ועוד"], { usage: { input_tokens: 1200, output_tokens: 80, cache_read_input_tokens: 900, cache_creation_input_tokens: null } });
  const log = callLog(r, { requestId: "req-1", userId: "u7", ms: 1234.6 });
  assert.deepEqual(log, {
    requestId: "req-1", userId: "u7", ms: 1235, model: "claude-opus-5-5", stopReason: "end_turn",
    inputTokens: 1200, outputTokens: 80, cacheReadTokens: 900, cacheWriteTokens: 0,
    blocks: ["thinking", "text", "text"], textChars: 24,
  });
  assert.ok(!JSON.stringify(log).includes("דנה"), "הטקסט לא נכנס ללוג");
});
test("usage חסר", () => {
  const r = message("x", { stop_reason: "max_tokens", usage: { cache_read_input_tokens: undefined, cache_creation_input_tokens: undefined } });
  const log = callLog(r, { requestId: "r", userId: "u", ms: 1 });
  assert.equal(log.cacheReadTokens, 0);
  assert.equal(log.cacheWriteTokens, 0);
  assert.equal(log.stopReason, "max_tokens");
});
