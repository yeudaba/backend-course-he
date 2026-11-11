// P15-E76: סכמת טופס יצירת קשר
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.email().transform((e) => e.toLowerCase()),
  phone: z.string().regex(/^\d{9,10}$/).optional(),
  topic: z.enum(["general", "billing", "support"]).default("general"),
  message: z.string().trim().min(10).max(1000),
});

export type Contact = z.infer<typeof contactSchema>;

const ok = contactSchema.safeParse({ name: " דנה ", email: "Dana@Example.COM", message: "  שלום, יש לי שאלה  " });
console.log(JSON.stringify(ok.data));
const bad = contactSchema.safeParse({ name: "ד", email: "x", phone: "050-1234567", topic: "sales", message: "קצר" });
console.log(bad.error?.issues.map((i) => i.path.join(".")).join(", "));
