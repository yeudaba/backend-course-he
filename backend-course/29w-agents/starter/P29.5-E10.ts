// P29.5-E10: אישור אנושי לפני פעולה — הסוכן עוצר, שומר מצב, וממשיך אחרי החלטה
import type Anthropic from "@anthropic-ai/sdk";

export interface ApprovalConfig {
  system: string;
  tools: Record<string, { definition: Anthropic.Tool; run: (input: any) => Promise<string> }>;
  needsApproval: (name: string, input: any) => boolean;
  maxSteps?: number;
  model?: string;
}

export interface RunState {
  messages: Anthropic.MessageParam[];
  waiting: { id: string; name: string; input: unknown }[]; // הקריאות של התור האחרון, שמחכות להחלטה
  steps: number;
}

export type AdvanceResult =
  | { status: "needs_approval"; state: RunState; pending: { id: string; name: string; input: unknown }[] }
  | { status: "done"; state: RunState; text: string }
  | { status: "max_steps"; state: RunState };

export const startState = (prompt: string): RunState => ({ messages: [{ role: "user", content: prompt }], waiting: [], steps: 0 });

async function execute(cfg: ApprovalConfig, calls: RunState["waiting"], decisions: Record<string, "approve" | "deny">): Promise<Anthropic.ToolResultBlockParam[]> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function advance(client: Anthropic, cfg: ApprovalConfig, state: RunState, decisions: Record<string, "approve" | "deny"> = {}): Promise<AdvanceResult> {
  throw new Error("עוד לא כתבת את הפתרון");
}
