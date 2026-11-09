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
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  try {
    for (let step = 1; step <= maxSteps; step++) {
      const res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, system, tools: Object.values(tools).map((t) => t.definition), messages });
      yield { type: "model", step, stopReason: res.stop_reason };
      messages.push({ role: "assistant", content: res.content });
      if (res.stop_reason !== "tool_use") {
        yield { type: "done", text: res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("") };
        return;
      }
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const c of res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")) {
        yield { type: "tool_start", id: c.id, name: c.name };
        let r: Anthropic.ToolResultBlockParam;
        try {
          const t = tools[c.name];
          if (!t) throw new Error(`אין כלי בשם ${c.name}`);
          r = { type: "tool_result", tool_use_id: c.id, content: await t.run(c.input) };
        } catch (err) {
          r = { type: "tool_result", tool_use_id: c.id, content: `שגיאה: ${(err as Error).message}`, is_error: true };
        }
        results.push(r);
        yield { type: "tool_end", id: c.id, name: c.name, isError: !!r.is_error };
      }
      messages.push({ role: "user", content: results });
    }
    yield { type: "error", message: "עבר את תקרת הצעדים" };
  } catch (err) {
    yield { type: "error", message: (err as Error).message };
  }
}
