// P29-E10: parseJsonReply — JSON מתוך טקסט חופשי של מודל, עם אימות
import { z } from "zod";

export function parseJsonReply<T>(text: string, schema: z.ZodType<T>): { ok: true; data: T } | { ok: false; error: string } {
  throw new Error("עוד לא כתבת את הפתרון");
}
