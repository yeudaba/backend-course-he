// P29-E06: ask — שאלה אחת ל־Claude, ותשובה שבודקים לפני שמשתמשים בה
import type Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

export type AskResult = { ok: true; text: string } | { ok: false; reason: "refusal" | "max_tokens" | "empty" };

export async function ask(client: Anthropic, question: string, options: { system?: string } = {}): Promise<AskResult> {
  throw new Error("עוד לא כתבת את הפתרון");
}
