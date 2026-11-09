// P29.5-E20: לולאת סוכן — שלוש תקלות
import type Anthropic from "@anthropic-ai/sdk";

export async function runSimpleAgent(
  client: Anthropic,
  { system, tools, prompt }: { system: string; tools: Record<string, { definition: Anthropic.Tool; run: (input: any) => Promise<string> }>; prompt: string },
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  for (let step = 0; step < 10; step++) {
    const res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, system, tools: Object.values(tools).map((t) => t.definition), messages });
    const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    messages.push({ role: "assistant", content: text });
    if (res.stop_reason !== "tool_use") return text;
    for (const c of res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")) {
      const out = await tools[c.name].run(c.input);
      messages.push({ role: "user", content: [{ type: "tool_result", tool_use_id: c.id, content: out }] });
    }
  }
  throw new Error("יותר מדי צעדים");
}
