// P29-E21: "ה־API מחזיר 400 על tool_result, המודל מפסיק לקרוא לכלים במקביל, ופעם אחת הלולאה רצה כל הלילה" — שלוש תקלות
import type Anthropic from "@anthropic-ai/sdk";

export async function runTools(
  client: Anthropic,
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "messages"> & { messages: Anthropic.MessageParam[] },
  handlers: Record<string, (input: unknown) => Promise<string>>,
  maxIterations = 6,
): Promise<Anthropic.Message> {
  const messages = [...params.messages];
  while (true) {
    const message = await client.messages.create({ ...params, messages });
    if (message.stop_reason !== "tool_use") return message;
    for (const block of message.content) {
      if (block.type !== "tool_use") continue;
      const output = await handlers[block.name](block.input);
      messages.push({ role: "user", content: [{ type: "tool_result", tool_use_id: block.id, content: output }] });
    }
  }
}
