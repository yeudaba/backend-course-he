import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { resumePoint } = await load(import.meta.url, "P29.5-E78.ts");
const u = (content) => ({ role: "user", content });
const a = (content) => ({ role: "assistant", content });
const tu = (id) => ({ type: "tool_use", id, name: "x", input: {} });

test("user אחרון ← call_model", () => {
  assert.deepEqual(resumePoint({ messages: [u("שלום")], results: {} }), { next: "call_model" });
  assert.deepEqual(resumePoint({ messages: [u("q"), a([tu("t1")]), u([{ type: "tool_result", tool_use_id: "t1", content: "r" }])], results: { t1: "r" } }), { next: "call_model" });
});
test("assistant עם כלים: pending / send_results", () => {
  const msgs = [u("q"), a([{ type: "thinking", thinking: "", signature: "s" }, { type: "text", text: "אבדוק" }, tu("t1"), tu("t2"), tu("t3")])];
  assert.deepEqual(resumePoint({ messages: msgs, results: {} }), { next: "run_tools", pending: ["t1", "t2", "t3"] });
  assert.deepEqual(resumePoint({ messages: msgs, results: { t2: "ok" } }), { next: "run_tools", pending: ["t1", "t3"] });
  assert.deepEqual(resumePoint({ messages: msgs, results: { t1: "", t2: "ok", t3: "x" } }), { next: "send_results" }, "תוצאה ריקה היא תוצאה");
});
test("assistant בלי כלים ← done; ריק ← שגיאה", () => {
  assert.deepEqual(resumePoint({ messages: [u("q"), a([{ type: "text", text: "הנה" }])], results: {} }), { next: "done" });
  assert.deepEqual(resumePoint({ messages: [u("q"), a("טקסט")], results: {} }), { next: "done" });
  assert.deepEqual(resumePoint({ messages: [u("q"), a([tu("t1")])], results: { toString: "x" } }), { next: "run_tools", pending: ["t1"] });
  assert.throws(() => resumePoint({ messages: [], results: {} }), Error);
});
