// P29-E23
import type Anthropic from "@anthropic-ai/sdk";

export const POLICY = "You answer questions about the shop's shipping, returns and warranty policy. ...";

export function buildRequest(policyDocument: string, question: string, now: Date): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model: "claude-opus-5-5",
    max_tokens: 2048,
    system: [
      // תקלה 1: התאריך היה בתוך ה־system ← כל בקשה עם prefix שונה, וה־cache לא נקרא אף פעם.
      // החלק הקבוע ראשון ועם cache_control (תקלה 2: לא היה בכלל), והמשתנה — אחריו
      { type: "text", text: `${POLICY}\n\n<policy>\n${policyDocument}\n</policy>`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: `(today is ${now.toISOString().slice(0, 10)})\n\n${question}` }],
  };
}

export function costUsd(usage: Anthropic.Usage, prices = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 }): number {
  // תקלה 3: היה (input + output) * prices.output ← הקלט חויב במחיר הפלט, ו־cache לא נספר בכלל
  return (
    (usage.input_tokens * prices.input +
      usage.output_tokens * prices.output +
      (usage.cache_creation_input_tokens ?? 0) * prices.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * prices.cacheRead) /
    1_000_000
  );
}
