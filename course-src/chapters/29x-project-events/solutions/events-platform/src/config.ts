// הגדרות מה־env — נכשלים מהר על הגדרה חסרה (פרק 25)
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  KAFKA_BROKERS: z.string().min(1).transform((s) => s.split(",").map((x) => x.trim())),
  EVENTS_TOPIC: z.string().min(1).default("events"),
  MYSQL_URL: z.string().url(),
  LAKE_DIR: z.string().min(1).default("./lake"),
  // "key1:tenant-a,key2:tenant-b" — בפרודקשן: Secret, לא ConfigMap
  API_KEYS: z.string().min(1).transform((s, ctx) => {
    const out: Record<string, string> = {};
    for (const pair of s.split(",")) {
      const [key, tenant] = pair.split(":").map((x) => x?.trim());
      if (!key || !tenant || key.length < 16) {
        ctx.addIssue({ code: "custom", message: "API_KEYS בפורמט key:tenant, key של 16 תווים לפחות" });
        return z.NEVER;
      }
      out[key] = tenant;
    }
    return out;
  }),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: Record<string, string | undefined>): Config {
  const r = schema.safeParse(env);
  if (!r.success) throw new Error("הגדרות לא תקינות: " + r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return r.data;
}
