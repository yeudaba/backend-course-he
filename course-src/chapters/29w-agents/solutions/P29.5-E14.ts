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
    runId: string;
    store: KV;
    system: string;
    tools: Record<string, { definition: Anthropic.Tool; run: (input: any) => Promise<string> }>;
    prompt: string;
    maxSteps?: number;
    model?: string;
  },
): Promise<string> {
  const key = `agent-run:${runId}`;
  const raw = await store.get(key);
  const s: Saved = raw ? JSON.parse(raw) : { messages: [{ role: "user", content: prompt }], results: {}, steps: 0 };
  const save = () => store.set(key, JSON.stringify(s));
  if (s.done !== undefined) return s.done;

  for (;;) {
    const last = s.messages.at(-1)!;
    if (last.role === "assistant") {
      // התור האחרון של המודל ביקש כלים — מריצים רק את מה שעוד לא רץ, ושומרים כל תוצאה מיד
      const calls = (last.content as Anthropic.ContentBlockParam[]).filter((b): b is Anthropic.ToolUseBlockParam => b.type === "tool_use");
      for (const c of calls) {
        if (s.results[c.id]) continue;
        const tool = tools[c.name];
        let result: Anthropic.ToolResultBlockParam;
        try {
          if (!tool) throw new Error(`אין כלי בשם ${c.name}`);
          result = { type: "tool_result", tool_use_id: c.id, content: await tool.run(c.input) };
        } catch (err) {
          result = { type: "tool_result", tool_use_id: c.id, content: `שגיאה: ${(err as Error).message}`, is_error: true };
        }
        s.results[c.id] = result;
        await save();
      }
      s.messages.push({ role: "user", content: calls.map((c) => s.results[c.id]) });
      await save();
      continue;
    }
    if (s.steps >= maxSteps) throw new Error(`הריצה ${runId} עברה ${maxSteps} צעדים`);
    const res = await client.messages.create({ model, max_tokens: 16000, system, tools: Object.values(tools).map((t) => t.definition), messages: s.messages });
    s.steps++;
    if (res.stop_reason === "tool_use") {
      s.messages.push({ role: "assistant", content: res.content });
      await save();
      continue;
    }
    s.messages.push({ role: "assistant", content: res.content });
    s.done = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    await save();
    return s.done;
  }
}
