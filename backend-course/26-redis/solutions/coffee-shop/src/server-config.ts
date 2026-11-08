import { z } from "zod";

// הגדרות של השרת עצמו (port, CORS, proxy) — נקראות ב־main.ts לפני שהאפליקציה עולה.
// בפרודקשן הכללים מחמירים: עדיף שהשרת לא יעלה בכלל מאשר שיעלה עם CORS פתוח או בלי לדעת שהוא מאחורי proxy.
const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    CORS_ORIGINS: z.string().optional(),
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
    DATABASE_URL: z.string().optional(),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV !== "production") return;
    if (!e.DATABASE_URL) ctx.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "חובה בפרודקשן" });
    if (!e.CORS_ORIGINS) ctx.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "חובה בפרודקשן — רשימת כתובות מופרדת בפסיקים" });
    for (const origin of e.CORS_ORIGINS?.split(",") ?? []) {
      if (!/^https:\/\/[^/*]+$/.test(origin.trim())) {
        ctx.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: `בפרודקשן רק https ובלי * או נתיב: ${origin.trim()}` });
      }
    }
  });

export interface ServerConfig {
  production: boolean;
  port: number;
  corsOrigins: string[];
  trustProxy: number | false;
}

export function loadServerConfig(env: Record<string, string | undefined>): ServerConfig {
  const r = schema.safeParse(env);
  if (!r.success) {
    throw new Error(`הגדרות שרת לא תקינות — ${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  const e = r.data;
  return {
    production: e.NODE_ENV === "production",
    port: e.PORT,
    corsOrigins: (e.CORS_ORIGINS ?? "http://localhost:5500").split(",").map((o) => o.trim()),
    trustProxy: e.TRUST_PROXY > 0 ? e.TRUST_PROXY : false,
  };
}
