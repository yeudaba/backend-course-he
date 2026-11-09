// P29.5-E20: לולאת סוכן — אחרי התיקון
import type Anthropic from "@anthropic-ai/sdk";

export async function runSimpleAgent(
  client: Anthropic,
  { system, tools, prompt }: { system: string; tools: Record<string, { definition: Anthropic.Tool; run: (input: any) => Promise<string> }>; prompt: string },
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  for (let step = 0; step < 10; step++) {
    const res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, system, tools: Object.values(tools).map((t) => t.definition), messages });
    // תיקון 3: כל ה־content חוזר כמו שהוא — בלי בלוקי ה־tool_use, ה־tool_result הבא מצביע על id שלא קיים (400)
    messages.push({ role: "assistant", content: res.content });
    if (res.stop_reason !== "tool_use") return res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const c of res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")) {
      try {
        results.push({ type: "tool_result", tool_use_id: c.id, content: await tools[c.name].run(c.input) });
      } catch (err) {
        // תיקון 2: שגיאה של כלי חוזרת למודל כ־is_error, לא מפילה את הסוכן
        results.push({ type: "tool_result", tool_use_id: c.id, content: `שגיאה: ${(err as Error).message}`, is_error: true });
      }
    }
    messages.push({ role: "user", content: results }); // תיקון 1: כל התוצאות בהודעה אחת
  }
  throw new Error("יותר מדי צעדים");
}
