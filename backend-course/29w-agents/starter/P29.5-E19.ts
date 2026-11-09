// P29.5-E19: אירועי התקדמות — כדי שהמשתמש יראה מה הסוכן עושה (SSE, WebSocket)
import type Anthropic from "@anthropic-ai/sdk";

export type AgentEvent =
  | { type: "model"; step: number; stopReason: string | null }
  | { type: "tool_start"; id: string; name: string }
  | { type: "tool_end"; id: string; name: string; isError: boolean }
  | { type: "done"; text: string }
  | { type: "error"; message: string };

export async function* agentEvents(
  client: Anthropic,
  { system, tools, prompt, maxSteps = 10 }: { system: string; tools: Record<string, { definition: Anthropic.Tool; run: (input: any) => Promise<string> }>; prompt: string; maxSteps?: number },
): AsyncGenerator<AgentEvent> {
  throw new Error("עוד לא כתבת את הפתרון");
}
