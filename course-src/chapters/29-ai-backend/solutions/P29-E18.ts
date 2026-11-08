// P29-E18
import type Anthropic from "@anthropic-ai/sdk";

// קיצור היסטוריה לפי תקציב טוקנים: משאירים את הסוף. אסור לחתוך בין tool_use לבין ה־tool_result שלו
// (ה־API דוחה tool_result בלי tool_use לפניו), וההודעה הראשונה חייבת להיות user עם טקסט — לא tool_result
const hasToolResult = (m: Anthropic.MessageParam) => Array.isArray(m.content) && m.content.some((b) => b.type === "tool_result");

export function trimHistory(messages: readonly Anthropic.MessageParam[], maxTokens: number, estimate: (m: Anthropic.MessageParam) => number): Anthropic.MessageParam[] {
  let total = 0;
  let start = messages.length;
  for (let i = messages.length - 1; i >= 0; i--) {
    const cost = estimate(messages[i]);
    if (total + cost > maxTokens) break;
    total += cost;
    start = i;
  }
  // מקדמים את ההתחלה עד הודעת user "נקייה" — כך לא נשאר tool_result יתום ולא assistant ראשון
  while (start < messages.length && (messages[start].role !== "user" || hasToolResult(messages[start]))) start++;
  return messages.slice(start);
}
