// P29-E10
import { z } from "zod";

// כשאין structured outputs (מודל אחר, ספק אחר, טקסט חופשי עם JSON בתוכו): מחלצים, מפענחים ומאמתים.
// פלט של מודל הוא קלט לא אמין — בדיוק כמו body של בקשה (פרק 15)
export function parseJsonReply<T>(text: string, schema: z.ZodType<T>): { ok: true; data: T } | { ok: false; error: string } {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  let candidate = fenced ? fenced[1] : text;
  if (!fenced) {
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start === -1 || end < start) return { ok: false, error: "לא נמצא JSON בתשובה" };
    candidate = candidate.slice(start, end + 1);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(candidate.trim());
  } catch {
    return { ok: false, error: "JSON לא תקין" };
  }
  const result = schema.safeParse(raw);
  return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ") };
}
