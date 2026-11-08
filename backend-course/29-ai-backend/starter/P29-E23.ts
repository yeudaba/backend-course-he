// P29-E23: "הוספנו prompt caching, ו־cache_read_input_tokens תמיד 0; והחשבון החודשי לא תואם את הדוח שלנו" — שלוש תקלות
import type Anthropic from "@anthropic-ai/sdk";

export const POLICY = "You answer questions about the shop's shipping, returns and warranty policy. ...";

export function buildRequest(policyDocument: string, question: string, now: Date): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model: "claude-opus-5-5",
    max_tokens: 2048,
    system: `${POLICY}\nCurrent time: ${now.toISOString()}\n\n<policy>\n${policyDocument}\n</policy>`,
    messages: [{ role: "user", content: question }],
  };
}

export function costUsd(usage: Anthropic.Usage, prices = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 }): number {
  return ((usage.input_tokens + usage.output_tokens) * prices.output) / 1_000_000;
}
