// P26.3-E83: בדיקת values עם zod לפני deploy
import { z } from "zod";

const nonEmpty = z.string().min(1);
const HOST = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

const schema = z
  .object({
    replicas: z.number().int().min(1).max(20),
    image: z.object({ repository: nonEmpty, tag: nonEmpty.refine((t) => t !== "latest", "לא latest — גרסה קבועה") }),
    resources: z.object({
      requests: z.object({ cpu: nonEmpty, memory: nonEmpty }),
      limits: z.object({ memory: nonEmpty }),
    }),
    ingress: z.object({ enabled: z.boolean(), host: z.string().optional() }).optional(),
    autoscaling: z.object({ enabled: z.boolean(), minReplicas: z.number().int().optional(), maxReplicas: z.number().int().optional() }).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.ingress?.enabled && !HOST.test(v.ingress.host ?? "")) {
      ctx.addIssue({ code: "custom", path: ["ingress", "host"], message: "שם מארח לא תקין" });
    }
    const a = v.autoscaling;
    if (a?.enabled) {
      if ((a.minReplicas ?? 0) < 2) ctx.addIssue({ code: "custom", path: ["autoscaling", "minReplicas"], message: "לפחות 2" });
      if ((a.minReplicas ?? 0) > (a.maxReplicas ?? 0)) ctx.addIssue({ code: "custom", path: ["autoscaling", "maxReplicas"], message: "קטן מ־minReplicas" });
    }
  });

export function validateValues(values: unknown) {
  const r = schema.safeParse(values);
  return r.success ? [] : r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}
