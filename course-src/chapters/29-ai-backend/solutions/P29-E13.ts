// P29-E13
import type Anthropic from "@anthropic-ai/sdk";

export type Handler = (input: unknown) => Promise<string> | string;

// הלולאה של tool use: המודל מבקש כלי ← אנחנו מריצים ← מחזירים תוצאה ← שוב, עד end_turn.
// הכללים: כל ה־tool_result של סיבוב — בהודעת user אחת; כל tool_use_id מקבל תשובה (גם על שגיאה, עם is_error);
// ותקרה על מספר הסיבובים — כדי שמודל "תקוע" לא ירוץ (וישלם) לנצח
export async function runTools(
  client: Anthropic,
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "messages"> & { messages: Anthropic.MessageParam[] },
  handlers: Record<string, Handler>,
  { maxIterations = 8 }: { maxIterations?: number } = {},
): Promise<{ message: Anthropic.Message; messages: Anthropic.MessageParam[]; toolCalls: number }> {
  const messages = [...params.messages];
  let toolCalls = 0;
  for (let i = 0; i < maxIterations; i++) {
    const message = await client.messages.create({ ...params, messages });
    if (message.stop_reason !== "tool_use") return { message, messages, toolCalls };
    messages.push({ role: "assistant", content: message.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of message.content) {
      if (block.type !== "tool_use") continue;
      toolCalls++;
      const handler = handlers[block.name];
      if (!handler) {
        results.push({ type: "tool_result", tool_use_id: block.id, is_error: true, content: `כלי לא מוכר: ${block.name}` });
        continue;
      }
      try {
        results.push({ type: "tool_result", tool_use_id: block.id, content: await handler(block.input) });
      } catch (err) {
        results.push({ type: "tool_result", tool_use_id: block.id, is_error: true, content: (err as Error).message });
      }
    }
    messages.push({ role: "user", content: results });
  }
  throw new Error(`הלולאה לא הסתיימה אחרי ${maxIterations} סיבובים`);
}
