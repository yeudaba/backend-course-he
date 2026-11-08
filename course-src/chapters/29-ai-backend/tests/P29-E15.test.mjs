import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { streamToSse } = await load(import.meta.url, "P29-E15.ts");
async function* events(list) { for (const e of list) yield e; }
const ev = [
  { type: "message_start", message: {} },
  { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "" } },
  { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "סוד" } },
  { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
  { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "שלום\n" } },
  { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "עולם" } },
  { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 5 } },
  { type: "message_stop" },
];

test("רק טקסט, כ־SSE עם JSON, ו־done בסוף", async () => {
  const out = [];
  const r = await streamToSse(events(ev), (c) => out.push(c));
  assert.deepEqual(out, ['data: {"text":"שלום\\n"}\n\n', 'data: {"text":"עולם"}\n\n', 'event: done\ndata: {"stop_reason":"end_turn"}\n\n']);
  assert.equal(r.chars, 9);
  assert.ok(!out.join("").includes("סוד"), "thinking לא יוצא ללקוח");
});
test("שגיאה באמצע ← event: error לפני שזורקים", async () => {
  async function* broken() { yield ev[4]; throw new Error("connection reset"); }
  const out = [];
  await assert.rejects(streamToSse(broken(), (c) => out.push(c)), /connection reset/);
  assert.equal(out.length, 2);
  assert.match(out[1], /^event: error\n/);
});
