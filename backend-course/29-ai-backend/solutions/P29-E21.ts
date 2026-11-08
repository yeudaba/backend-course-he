// P29-E21
import type Anthropic from "@anthropic-ai/sdk";

export async function runTools(
  client: Anthropic,
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "messages"> & { messages: Anthropic.MessageParam[] },
  handlers: Record<string, (input: unknown) => Promise<string>>,
  maxIterations = 6,
): Promise<Anthropic.Message> {
  const messages = [...params.messages];
  for (let i = 0; i < maxIterations; i++) { // תקלה 3: היה while (true) ← מודל שממשיך לבקש כלים רץ (ומשלם) בלי סוף
    const message = await client.messages.create({ ...params, messages });
    if (message.stop_reason !== "tool_use") return message;
    messages.push({ role: "assistant", content: message.content }); // תקלה 1: ה־assistant לא נוסף ← tool_result בלי tool_use לפניו — 400
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of message.content) {
      if (block.type !== "tool_use") continue;
      const output = await handlers[block.name](block.input);
      results.push({ type: "tool_result", tool_use_id: block.id, content: output });
    }
    messages.push({ role: "user", content: results }); // תקלה 2: הודעת user נפרדת לכל תוצאה ← "מלמד" את המודל להפסיק לקרוא לכלים במקביל
  }
  throw new Error("יותר מדי סיבובים");
}
