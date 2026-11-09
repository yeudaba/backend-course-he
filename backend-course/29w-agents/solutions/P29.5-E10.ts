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
  return Promise.all(
    calls.map(async (c): Promise<Anthropic.ToolResultBlockParam> => {
      const tool = cfg.tools[c.name];
      if (!tool) return { type: "tool_result", tool_use_id: c.id, content: `אין כלי בשם ${c.name}`, is_error: true };
      if (cfg.needsApproval(c.name, c.input) && decisions[c.id] !== "approve") {
        return { type: "tool_result", tool_use_id: c.id, content: "המשתמש לא אישר את הפעולה. אל תנסה שוב — שאל אותו מה לעשות.", is_error: true };
      }
      try {
        return { type: "tool_result", tool_use_id: c.id, content: await tool.run(c.input) };
      } catch (err) {
        return { type: "tool_result", tool_use_id: c.id, content: `שגיאה: ${(err as Error).message}`, is_error: true };
      }
    }),
  );
}

export async function advance(client: Anthropic, cfg: ApprovalConfig, state: RunState, decisions: Record<string, "approve" | "deny"> = {}): Promise<AdvanceResult> {
  const s: RunState = structuredClone(state); // לא משנים את המצב שקיבלנו — הוא אולי שמור במסד
  const maxSteps = cfg.maxSteps ?? 10;
  if (s.waiting.length) {
    const needing = s.waiting.filter((c) => cfg.needsApproval(c.name, c.input));
    const missing = needing.filter((c) => !(c.id in decisions));
    if (missing.length) return { status: "needs_approval", state: s, pending: missing };
    s.messages.push({ role: "user", content: await execute(cfg, s.waiting, decisions) });
    s.waiting = [];
  }
  while (s.steps < maxSteps) {
    s.steps++;
    const res = await client.messages.create({
      model: cfg.model ?? "claude-opus-5-5",
      max_tokens: 16000,
      system: cfg.system,
      tools: Object.values(cfg.tools).map((t) => t.definition),
      messages: s.messages,
    });
    s.messages.push({ role: "assistant", content: res.content });
    if (res.stop_reason !== "tool_use") {
      return { status: "done", state: s, text: res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("") };
    }
    const calls = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use").map((b) => ({ id: b.id, name: b.name, input: b.input }));
    const needing = calls.filter((c) => cfg.needsApproval(c.name, c.input));
    if (needing.length) {
      s.waiting = calls; // עוצרים לפני שמריצים משהו מהתור הזה — גם את הכלים שלא צריכים אישור
      return { status: "needs_approval", state: s, pending: needing };
    }
    s.messages.push({ role: "user", content: await execute(cfg, calls, {}) });
  }
  return { status: "max_steps", state: s };
}
