// P26-E94: מפתח הקטלוג מתוך DTO עם zod
import { z } from "zod";

const schema = z.object({
  q: z.string().trim().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export function productsCacheKey(query: unknown): string {
  const r = schema.safeParse(query);
  if (!r.success) throw new Error("VALIDATION_ERROR");
  const { q, sort, page, limit } = r.data;
  return JSON.stringify({ ...(q ? { q } : {}), sort, page, limit });
}
