// P29-E12: createWithFallback — מודל חלופי כשהספק עמוס
import Anthropic from "@anthropic-ai/sdk";

export async function createWithFallback(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
  fallbackModel: string,
): Promise<{ message: Anthropic.Message; usedFallback: boolean }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
