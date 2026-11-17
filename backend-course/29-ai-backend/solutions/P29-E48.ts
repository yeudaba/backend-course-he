// P29-E48: סכמה לסיכום ביקורות
import { z } from "zod";

export const ReviewSummary = z.object({
  sentiment: z.enum(["positive", "mixed", "negative"]),
  pros: z.array(z.string().min(1)).max(5),
  cons: z.array(z.string().min(1)).max(5),
  average_rating: z.number().min(1).max(5).nullable(),
  summary_he: z.string().min(1).max(300),
});
export type Summary = z.infer<typeof ReviewSummary>;

export function parseSummary(raw: unknown): { ok: true; data: Summary } | { ok: false; issues: string[] } {
  const r = ReviewSummary.safeParse(raw);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, issues: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
}
