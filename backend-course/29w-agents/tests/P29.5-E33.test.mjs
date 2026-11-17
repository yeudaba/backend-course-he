import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { message, toolUse, thinking } from "./_claude.mjs";

const { nextAction } = await load(import.meta.url, "P29.5-E33.ts");

test("tool_use ← run_tools, לפי הסדר", () => {
  const m = message(["אבדוק", toolUse("get_order", { orderId: 3 }, "t1"), toolUse("search_products", { query: "V60" }, "t2")], { stop_reason: "tool_use" });
  assert.deepEqual(nextAction(m), { action: "run_tools", calls: [{ id: "t1", name: "get_order", input: { orderId: 3 } }, { id: "t2", name: "search_products", input: { query: "V60" } }] });
});
test("end_turn / stop_sequence ← done, רק טקסט", () => {
  assert.deepEqual(nextAction(message([thinking(), "  הזמנה 3 ", "נשלחה. "])), { action: "done", text: "הזמנה 3 נשלחה." });
  assert.deepEqual(nextAction(message([thinking()])), { action: "done", text: "" });
  assert.deepEqual(nextAction(message("עצרתי", { stop_reason: "stop_sequence" })), { action: "done", text: "עצרתי" });
});
test("pause_turn, max_tokens, refusal", () => {
  assert.deepEqual(nextAction(message([], { stop_reason: "pause_turn" })), { action: "continue" });
  assert.deepEqual(nextAction(message(["חלק", toolUse("refund_order", { orderId: 2 })], { stop_reason: "max_tokens" })), { action: "truncated" });
  const r = { ...message([], { stop_reason: "refusal" }), stop_details: { type: "refusal", category: "cyber", explanation: null } };
  assert.deepEqual(nextAction(r), { action: "refused", category: "cyber" });
  assert.deepEqual(nextAction(message([], { stop_reason: "refusal" })), { action: "refused", category: null });
});
test("ערך לא מוכר ← שגיאה", () => {
  assert.throws(() => nextAction(message("x", { stop_reason: "model_context_window_exceeded_v9" })), Error);
});
