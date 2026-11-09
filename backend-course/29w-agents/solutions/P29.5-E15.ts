// P29.5-E15: מוביל ועובדים — כל עובד מתחיל בהקשר נקי, ומחזיר רק סיכום
import type Anthropic from "@anthropic-ai/sdk";

export interface Worker {
  system: string;
  model?: string;
}

const MAX_REPORT = 2000;
const textOf = (m: Anthropic.Message) => m.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");

async function runWorker(client: Anthropic, w: Worker, instructions: string): Promise<string> {
  // הקשר חדש לגמרי: רק ההוראות — לא ההיסטוריה של המוביל
  const res = await client.messages.create({ model: w.model ?? "claude-opus-5-5", max_tokens: 8000, system: w.system, messages: [{ role: "user", content: instructions }] });
  const t = textOf(res);
  return t.length > MAX_REPORT ? t.slice(0, MAX_REPORT) + "…[קוצר]" : t;
}

export async function runLead(client: Anthropic, { system, task, workers, maxSteps = 8 }: { system: string; task: string; workers: Record<string, Worker>; maxSteps?: number }): Promise<string> {
  const delegate: Anthropic.Tool = {
    name: "delegate",
    description: `Give a self-contained sub-task to a worker. The worker sees only these instructions. Workers: ${Object.keys(workers).join(", ")}.`,
    input_schema: {
      type: "object",
      properties: { worker: { type: "string", enum: Object.keys(workers) }, instructions: { type: "string" } },
      required: ["worker", "instructions"],
      additionalProperties: false,
    },
  };
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];
  for (let i = 0; i < maxSteps; i++) {
    const res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, system, tools: [delegate], messages });
    messages.push({ role: "assistant", content: res.content });
    if (res.stop_reason !== "tool_use") return textOf(res);
    const calls = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    const results = await Promise.all( // כמה עובדים במקביל
      calls.map(async (c): Promise<Anthropic.ToolResultBlockParam> => {
        const { worker, instructions } = c.input as { worker: string; instructions: string };
        const w = workers[worker];
        if (!w) return { type: "tool_result", tool_use_id: c.id, content: `אין עובד בשם ${worker}`, is_error: true };
        try {
          return { type: "tool_result", tool_use_id: c.id, content: await runWorker(client, w, instructions) };
        } catch (err) {
          return { type: "tool_result", tool_use_id: c.id, content: `העובד נכשל: ${(err as Error).message}`, is_error: true };
        }
      }),
    );
    messages.push({ role: "user", content: results });
  }
  throw new Error("המוביל עבר את תקרת הצעדים");
}
