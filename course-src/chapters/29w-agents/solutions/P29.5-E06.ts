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
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  const usage = { inputTokens: 0, outputTokens: 0 };
  const textOf = (m: Anthropic.Message) => m.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");

  for (let step = 1; step <= maxSteps; step++) {
    const res = await client.messages.create({
      model,
      max_tokens: 16000,
      system,
      tools: Object.values(tools).map((t) => t.definition),
      messages,
    });
    usage.inputTokens += res.usage.input_tokens;
    usage.outputTokens += res.usage.output_tokens;

    if (res.stop_reason === "refusal") return { status: "refused", text: "", steps: step, usage };
    if (res.stop_reason === "max_tokens") return { status: "truncated", text: textOf(res), steps: step, usage };
    messages.push({ role: "assistant", content: res.content }); // כל התוכן — כולל tool_use ו־thinking — בלי לשנות
    if (res.stop_reason !== "tool_use") return { status: "done", text: textOf(res), steps: step, usage };

    const calls = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    // כלים במקביל; כל תוצאה — באותו סדר, וכולן בהודעת user אחת
    const results = await Promise.all(
      calls.map(async (c): Promise<Anthropic.ToolResultBlockParam> => {
        const tool = tools[c.name];
        if (!tool) return { type: "tool_result", tool_use_id: c.id, content: `אין כלי בשם ${c.name}`, is_error: true };
        try {
          return { type: "tool_result", tool_use_id: c.id, content: await tool.run(c.input) };
        } catch (err) {
          // שגיאה של כלי היא מידע למודל (יכול לתקן ולנסות שוב), לא קריסה של הסוכן
          return { type: "tool_result", tool_use_id: c.id, content: `שגיאה: ${(err as Error).message}`, is_error: true };
        }
      }),
    );
    messages.push({ role: "user", content: results });
  }
  return { status: "max_steps", text: "", steps: maxSteps, usage };
}
