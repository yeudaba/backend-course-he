// P29.5-E06: לולאת סוכן שמחזיקה מעמד — כלים במקביל, שגיאות ככלי, ותקרת צעדים
import type Anthropic from "@anthropic-ai/sdk";

export interface AgentTool {
  definition: Anthropic.Tool;
  run: (input: any) => Promise<string>;
}

export interface AgentResult {
  status: "done" | "max_steps" | "refused" | "truncated";
  text: string;
  steps: number;
  usage: { inputTokens: number; outputTokens: number };
}

export async function runAgent(
  client: Anthropic,
  { system, tools, prompt, maxSteps = 10, model = "claude-opus-5-5" }: { system: string; tools: Record<string, AgentTool>; prompt: string; maxSteps?: number; model?: string },
): Promise<AgentResult> {
  throw new Error("עוד לא כתבת את הפתרון");
}
