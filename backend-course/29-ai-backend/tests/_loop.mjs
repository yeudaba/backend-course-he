// בדיקות משותפות ל־E13 ו־E21 (לולאת כלים)
import assert from "node:assert/strict";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

export const params = {
  model: "claude-opus-5-5",
  max_tokens: 2048,
  tools: [{ name: "get_price", description: "price", input_schema: { type: "object", properties: { item: { type: "string" } }, required: ["item"] } }],
  messages: [{ role: "user", content: "כמה עולים לאטה ומוקה?" }],
};

export async function parallelRound(runTools) {
  const { client, bodies } = fakeClaude((b, i) =>
    i === 0 ? message([toolUse("get_price", { item: "latte" }, "t1"), toolUse("get_price", { item: "mocha" }, "t2")], { stop_reason: "tool_use" }) : message("לאטה 14, מוקה 16"),
  );
  const prices = { latte: "14", mocha: "16" };
  const out = await runTools(client, params, { get_price: async (input) => prices[input.item] });
  const second = bodies()[1].messages;
  assert.equal(second.length, 3, "user, assistant (עם ה־tool_use), ו־user אחד עם כל התוצאות");
  assert.equal(second[1].role, "assistant");
  assert.deepEqual(second[1].content.map((b) => b.id), ["t1", "t2"], "ה־assistant נשלח כמו שהוא, עם ה־tool_use");
  assert.equal(second[2].role, "user");
  assert.deepEqual(second[2].content.map((b) => [b.type, b.tool_use_id, b.content]), [["tool_result", "t1", "14"], ["tool_result", "t2", "16"]]);
  return out;
}

export async function endless(runTools, max) {
  // אחרי 20 קריאות הספק "המדומה" מחזיר שגיאה — כדי שלולאה בלי תקרה תיכשל מהר ולא תתקע את הבדיקה
  const { client, bodies } = fakeClaude((b, i) => (i >= 20 ? { error: 400, message: "too many calls in test" } : message([toolUse("get_price", { item: "x" })], { stop_reason: "tool_use" })));
  await assert.rejects(runTools(client, params, { get_price: async () => "1" }, max));
  return bodies().length;
}
