import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { firstChangedMessage } = await load(import.meta.url, "P29.5-E36.ts");
const h = [
  { role: "user", content: "מה עם הזמנה 3?" },
  { role: "assistant", content: [{ type: "thinking", thinking: "", signature: "s" }, { type: "tool_use", id: "t1", name: "get_order", input: { orderId: 3, opts: [1, null] } }] },
  { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: '{"status":"shipped"}' }] },
];

test("הוספה בלבד ← null (גם עם סדר מפתחות אחר)", () => {
  const next = [...structuredClone(h), { role: "assistant", content: [{ type: "text", text: "נשלחה" }] }];
  next[1] = { content: [{ signature: "s", thinking: "", type: "thinking" }, { input: { opts: [1, null], orderId: 3 }, name: "get_order", id: "t1", type: "tool_use" }], role: "assistant" };
  assert.equal(firstChangedMessage(h, next), null);
  assert.equal(firstChangedMessage(h, structuredClone(h)), null);
  assert.equal(firstChangedMessage([], h), null);
});
test("עריכה, מחיקה, קיצור", () => {
  const noThinking = structuredClone(h);
  noThinking[1].content.shift();
  assert.equal(firstChangedMessage(h, noThinking), 1, "מחקו את בלוק ה־thinking");
  const shorter = structuredClone(h);
  shorter[2].content[0].content = '{"status":"sh…"}';
  assert.equal(firstChangedMessage(h, shorter), 2);
  assert.equal(firstChangedMessage(h, h.slice(0, 2)), 2, "הודעה חסרה");
  assert.equal(firstChangedMessage(h, []), 0);
});
test("שוויון עמוק — מקרי קצה", () => {
  assert.equal(firstChangedMessage([{ a: [1, 2] }], [{ a: [2, 1] }]), 0, "סדר במערך");
  assert.equal(firstChangedMessage([{ a: 1 }], [{ a: 1, b: undefined }]), 0, "מפתח נוסף");
  assert.equal(firstChangedMessage([{ a: null }], [{ a: {} }]), 0);
  assert.equal(firstChangedMessage([{ a: [] }], [{ a: {} }]), 0, "מערך ≠ אובייקט");
  assert.equal(firstChangedMessage([{ a: "1" }], [{ a: 1 }]), 0);
  assert.equal(firstChangedMessage([{ a: { b: { c: 1 } } }], [{ a: { b: { c: 1 } } }]), null);
});
