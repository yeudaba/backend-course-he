// P29.5-E12: tracing לסוכן — כל קריאה למודל וכל כלי: זמן, טוקנים ועלות
import type Anthropic from "@anthropic-ai/sdk";

export interface Price {
  input: number; // $ למיליון טוקנים
  output: number;
  cacheRead: number;
}
export const PRICES: Record<string, Price> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01 },
};

export interface ModelSpan {
  kind: "model";
  step: number;
  model: string;
  stopReason: string | null;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  costUsd: number;
  ms: number;
}
export interface ToolSpan {
  kind: "tool";
  name: string;
  ms: number;
  isError: boolean;
}

export function createTracer(prices: Record<string, Price> = PRICES) {
  throw new Error("עוד לא כתבת את הפתרון");
}
