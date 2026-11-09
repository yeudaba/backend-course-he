// שלב 5 (רשות): עוזר אנליטיקה — שאלה בעברית ← כלים מעל ה־query API ← תשובה עם מספרים
import type Anthropic from "@anthropic-ai/sdk";

export interface QueryFns {
  daily(from: string, to: string, name?: string): Promise<unknown>;
  funnel(steps: string[], from: string, to: string): Promise<unknown>;
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "daily_stats",
    description: "Events and active users per day (Israel time) for the current tenant. Optionally only one event name. Range up to 92 days.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string", description: "YYYY-MM-DD" },
        to: { type: "string", description: "YYYY-MM-DD" },
        name: { type: "string", description: "event name, e.g. purchase" },
      },
      required: ["from", "to"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "funnel",
    description: "How many users did each step in order (each step after the previous one) in a date range. 2-5 event names.",
    input_schema: {
      type: "object",
      properties: { steps: { type: "array", items: { type: "string" } }, from: { type: "string" }, to: { type: "string" } },
      required: ["steps", "from", "to"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export function createAnalyticsAssistant({ client, query, now = () => new Date(), maxSteps = 6 }: { client: Anthropic; query: QueryFns; now?: () => Date; maxSteps?: number }) {
  return {
    async ask(question: string) {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now());
      const system = `You answer product analytics questions for one company, using only the tools. Today is ${today} (Israel time). Answer in Hebrew, short, with the numbers you got from the tools. If the tools cannot answer, say so.`;
      const messages: Anthropic.MessageParam[] = [{ role: "user", content: question }];
      const toolCalls: { name: string; input: unknown }[] = [];
      for (let step = 1; step <= maxSteps; step++) {
        const res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 4000, system, tools: TOOLS, messages });
        messages.push({ role: "assistant", content: res.content });
        if (res.stop_reason !== "tool_use") {
          return { text: res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(""), toolCalls, steps: step };
        }
        const calls = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
        const results = await Promise.all(
          calls.map(async (c): Promise<Anthropic.ToolResultBlockParam> => {
            toolCalls.push({ name: c.name, input: c.input });
            const i = c.input as any;
            try {
              const out = c.name === "daily_stats" ? await query.daily(i.from, i.to, i.name) : c.name === "funnel" ? await query.funnel(i.steps, i.from, i.to) : null;
              if (out === null) throw new Error(`אין כלי בשם ${c.name}`);
              return { type: "tool_result", tool_use_id: c.id, content: JSON.stringify(out) };
            } catch (err) {
              return { type: "tool_result", tool_use_id: c.id, content: `שגיאה: ${(err as Error).message}`, is_error: true };
            }
          }),
        );
        messages.push({ role: "user", content: results });
      }
      return { text: "לא הצלחתי לענות בזמן — נסה שאלה ממוקדת יותר.", toolCalls, steps: maxSteps };
    },
  };
}
