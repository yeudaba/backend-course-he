// P28.5-E20: ייבוא אירועים מ־NDJSON — שלוש תקלות
import type { Readable } from "node:stream";

export async function importEvents(input: Readable, onEvent: (e: any) => Promise<void>): Promise<number> {
  let count = 0;
  for await (const chunk of input) {
    for (const line of chunk.toString().split("\n").slice(0, -1)) {
      if (!line.trim()) continue;
      onEvent(JSON.parse(line));
      count++;
    }
  }
  return count;
}
