// P29-E34: שורת לוג לכל קריאה
import type Anthropic from "@anthropic-ai/sdk";

export function callLog(response: Anthropic.Message, meta: { requestId: string; userId: string; ms: number }) {
  const u = response.usage;
  return {
    requestId: meta.requestId,
    userId: meta.userId,
    ms: Math.round(meta.ms),
    model: response.model,
    stopReason: response.stop_reason,
    inputTokens: u.input_tokens ?? 0,
    outputTokens: u.output_tokens ?? 0,
    cacheReadTokens: u.cache_read_input_tokens ?? 0,
    cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
    blocks: response.content.map((b) => b.type),
    textChars: response.content.reduce((n, b) => n + (b.type === "text" ? b.text.length : 0), 0),
  };
}
