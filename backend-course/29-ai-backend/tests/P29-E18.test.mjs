import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { trimHistory } = await load(import.meta.url, "P29-E18.ts");
const est = () => 10;
const u = (t) => ({ role: "user", content: t });
const a = (t) => ({ role: "assistant", content: t });
const call = (id) => ({ role: "assistant", content: [{ type: "text", text: "בודק" }, { type: "tool_use", id, name: "get_order", input: {} }] });
const result = (id) => ({ role: "user", content: [{ type: "tool_result", tool_use_id: id, content: "{}" }] });

test("משאיר את הסוף בתוך התקציב", () => {
  const h = [u("1"), a("2"), u("3"), a("4"), u("5")];
  assert.deepEqual(trimHistory(h, 30, est), [u("3"), a("4"), u("5")]);
  assert.deepEqual(trimHistory(h, 1000, est), h);
});
test("לא מתחיל ב־assistant", () => {
  const h = [u("1"), a("2"), u("3"), a("4"), u("5")];
  assert.deepEqual(trimHistory(h, 40, est), [u("3"), a("4"), u("5")]);
});
test("לא חותך בין tool_use ל־tool_result", () => {
  const h = [u("q1"), call("t1"), result("t1"), a("הזמנה 3 נשלחה"), u("q2")];
  const out = trimHistory(h, 30, est);
  assert.deepEqual(out, [u("q2")], "אסור להתחיל ב־tool_result בלי ה־tool_use שלו");
  assert.deepEqual(trimHistory(h, 50, est), h);
});
