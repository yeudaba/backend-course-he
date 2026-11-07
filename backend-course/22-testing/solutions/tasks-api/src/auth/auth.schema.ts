import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("אימייל לא תקין"));

// bcrypt משתמש רק ב־72 הבתים הראשונים — סיסמה ארוכה יותר "נחתכת" בשקט. עדיף לסרב.
const password = z
  .string()
  .min(8, "לפחות 8 תווים")
  .refine((p) => Buffer.byteLength(p, "utf8") <= 72, "עד 72 בתים (בערך 36 אותיות בעברית)");

// strictObject: { "role": "admin" } בגוף ← 400, לא "נבלע" (mass assignment — שיעור 4)
export const registerSchema = z.strictObject({ email, password });

// בכניסה לא בודקים את חוקי הסיסמה — רק שנשלחה. (אחרת תוקף לומד את המדיניות)
export const loginSchema = z.object({ email, password: z.string().min(1, "חובה") });

export const refreshSchema = z.object({ refreshToken: z.string().min(1, "חובה") });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
