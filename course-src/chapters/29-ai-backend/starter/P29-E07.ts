// P29-E07: buildMessages — היסטוריית שיחה ← messages לבקשה
import type Anthropic from "@anthropic-ai/sdk";

export interface Turn {
  role: "user" | "assistant";
  text: string;
}

export function buildMessages(history: readonly Turn[], question: string, maxTurns = 5): Anthropic.MessageParam[] {
  throw new Error("עוד לא כתבת את הפתרון");
}
