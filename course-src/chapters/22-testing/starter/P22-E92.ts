// P22-E92 — הקוד שבודקים (לא משנים אותו)
import { z } from "zod";

export const registerSchema = z.strictObject({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z
    .string()
    .min(8, "לפחות 8 תווים")
    .refine((p) => Buffer.byteLength(p, "utf8") <= 72, "עד 72 בתים"),
});

export function parseRegister(body: unknown) {
  const r = registerSchema.safeParse(body);
  if (r.success) return { ok: true as const, data: r.data };
  return { ok: false as const, errors: r.error.issues.map((i) => i.message) };
}
