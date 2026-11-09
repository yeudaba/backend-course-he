// P29.5-E14: ריצה עמידה — מצב נשמר אחרי כל צעד; אחרי קריסה ממשיכים, בלי לחזור על מה שכבר קרה
import type Anthropic from "@anthropic-ai/sdk";

export interface KV {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

interface Saved {
  messages: Anthropic.MessageParam[];
  results: Record<string, Anthropic.ToolResultBlockParam>; // tool_use_id ← תוצאה שכבר חושבה
  steps: number;
  done?: string;
}

export async function runDurable(
  client: Anthropic,
  { runId, store, system, tools, prompt, maxSteps = 10, model = "claude-opus-5-5" }: {
  throw new Error("עוד לא כתבת את הפתרון");
}
