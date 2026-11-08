// P29-E13: runTools — הלולאה של tool use
import type Anthropic from "@anthropic-ai/sdk";

export type Handler = (input: unknown) => Promise<string> | string;

export async function runTools(
  client: Anthropic,
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "messages"> & { messages: Anthropic.MessageParam[] },
  handlers: Record<string, Handler>,
  options: { maxIterations?: number } = {},
): Promise<{ message: Anthropic.Message; messages: Anthropic.MessageParam[]; toolCalls: number }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
