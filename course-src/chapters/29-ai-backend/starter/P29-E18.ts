// P29-E18: trimHistory — קיצור שיחה לפי תקציב טוקנים
import type Anthropic from "@anthropic-ai/sdk";

export function trimHistory(messages: readonly Anthropic.MessageParam[], maxTokens: number, estimate: (m: Anthropic.MessageParam) => number): Anthropic.MessageParam[] {
  throw new Error("עוד לא כתבת את הפתרון");
}
