import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("אימייל לא תקין"));

export const registerSchema = z.strictObject({
  email,
  // bcrypt קורא רק 72 בתים ראשונים (פרק 21)
  password: z.string().min(8, "לפחות 8 תווים").refine((p) => Buffer.byteLength(p) <= 72, "עד 72 בתים"),
  name: z.string().trim().min(1, "שם חובה").max(100),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.strictObject({ email, password: z.string().min(1) });
export type LoginInput = z.infer<typeof loginSchema>;
