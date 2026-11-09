// P28.5-E20: ייבוא אירועים מ־NDJSON — אחרי התיקון
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";

export async function importEvents(input: Readable, onEvent: (e: any) => Promise<void>): Promise<number> {
  let count = 0;
  // תיקון 1+2: readline מחבר שורות שנחתכו בין chunks (וגם תו עברי שנחתך), ומחזיר גם שורה אחרונה בלי \n
  for await (const line of createInterface({ input, crlfDelay: Infinity })) {
    if (!line.trim()) continue;
    await onEvent(JSON.parse(line)); // תיקון 3: מחכים — backpressure, ושגיאה עולה למעלה
    count++;
  }
  return count;
}
