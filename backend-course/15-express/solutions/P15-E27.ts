// P15-E27: סכמת הרשמה עם regex
import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z][a-z0-9_]{2,15}$/, "שם משתמש: 3–16 תווים — אותיות באנגלית, ספרות ו־_, ומתחיל באות"),
  phone: z
    .string()
    .transform((s) => s.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+972|0)5\d{8}$/, "טלפון נייד ישראלי: 05XXXXXXXX"))
    .transform((s) => s.replace(/^\+972/, "0")),
  password: z
    .string()
    .min(8, "סיסמה: לפחות 8 תווים")
    .regex(/[A-Z]/, "סיסמה: לפחות אות גדולה אחת")
    .regex(/\d/, "סיסמה: לפחות ספרה אחת"),
});

export type Signup = z.infer<typeof signupSchema>;

console.log(signupSchema.parse({ username: " Dana_88 ", phone: "+972 50-123-4567", password: "Secret123" }));
const bad = signupSchema.safeParse({ username: "8dana", phone: "03-1234567", password: "secret" });
if (!bad.success) {
  for (const issue of bad.error.issues) console.log(issue.path.join("."), "—", issue.message);
}
