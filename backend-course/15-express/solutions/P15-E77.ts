// P15-E77: שגיאות לפי שדה
import express from "express";
import { z } from "zod";

export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

export const signupSchema = z.object({
  email: z.email("אימייל לא תקין"),
  password: z.string().min(8, "לפחות 8 תווים").regex(/\d/, "חייבת ספרה"),
  tags: z.array(z.string().min(1, "תגית ריקה")).default([]),
});

export function createApp() {
  const app = express();
  app.use(express.json());
  app.post("/signup", (req, res) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", fields: toFieldErrors(result.error) } });
      return;
    }
    const { email, tags } = result.data;
    res.status(201).json({ email, tags });
  });
  return app;
}

const r = signupSchema.safeParse({ email: "dana", password: "abc", tags: ["ok", "", ""] });
if (!r.success) console.log(JSON.stringify(toFieldErrors(r.error)));
console.log(JSON.stringify(toFieldErrors(signupSchema.safeParse("x").error!)));
