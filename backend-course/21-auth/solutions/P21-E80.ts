// P21-E80: parsePaging — גבולות בשרת, לא באמון בלקוח
import { z } from "zod";

export const pagingSchema = z.object({
  limit: z.coerce.number().int().min(1, "limit מ־1").max(50, "limit עד 50").default(20),
  offset: z.coerce.number().int().min(0, "offset מ־0").max(10000, "offset עד 10000").default(0),
});

export function parsePaging(query: unknown) {
  const r = pagingSchema.safeParse(query);
  if (!r.success) return { ok: false as const, errors: r.error.issues.map((i) => i.message) };
  return { ok: true as const, limit: r.data.limit, offset: r.data.offset };
}
