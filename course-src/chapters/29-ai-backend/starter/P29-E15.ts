// P29-E15: streamToSse — אירועי streaming ← Server-Sent Events
import type Anthropic from "@anthropic-ai/sdk";

export async function streamToSse(events: AsyncIterable<Anthropic.MessageStreamEvent>, write: (chunk: string) => void): Promise<{ chars: number }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
