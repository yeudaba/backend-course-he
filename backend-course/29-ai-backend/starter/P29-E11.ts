// P29-E11: מסמך לא אמין בתוך prompt
import type Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

export function wrapUntrusted(tag: string, content: string): string {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function buildSummaryRequest(document: string, maxWords = 60): Anthropic.MessageCreateParamsNonStreaming {
  throw new Error("עוד לא כתבת את הפתרון");
}
