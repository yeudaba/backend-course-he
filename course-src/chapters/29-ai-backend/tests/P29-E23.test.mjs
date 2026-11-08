import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { buildRequest, costUsd } = await load(import.meta.url, "P29-E23.ts");
const doc = "החזרות: 14 יום. אחריות: שנה.".repeat(50);

test("ה־system זהה בין ימים — וה־cache יכול לעבוד", () => {
  const a = buildRequest(doc, "כמה זמן אחריות?", new Date("2026-11-08T10:00:00Z"));
  const b = buildRequest(doc, "ומה עם החזרות?", new Date("2026-11-09T18:30:00Z"));
  assert.deepEqual(a.system, b.system);
  assert.match(userText(b.messages[0]), /2026-11-09/, "התאריך עדיין מגיע — בהודעה, אחרי ה־cache");
});
test("cache_control על הבלוק הקבוע", () => {
  const r = buildRequest(doc, "q", new Date());
  const blocks = Array.isArray(r.system) ? r.system : [];
  assert.ok(blocks.some((b) => b.cache_control?.type === "ephemeral" && b.text.includes(doc)));
});
test("עלות: כל מונה במחיר שלו", () => {
  assert.equal(costUsd({ input_tokens: 1_000_000, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }), 4);
  assert.equal(costUsd({ input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 1_000_000 }), 0.2);
  assert.equal(costUsd({ input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 1_000_000, cache_read_input_tokens: 0 }), 5);
});
