// P30-E119: API קטן למעקב אחרי מועמדויות
import express from "express";
import { z } from "zod";

const STAGES = ["applied", "screen", "interview", "offer", "rejected"] as const;
type Stage = (typeof STAGES)[number];
const NEXT: Record<Stage, Stage[]> = { applied: ["screen", "rejected"], screen: ["interview", "rejected"], interview: ["offer", "rejected"], offer: [], rejected: [] };

const Create = z.object({
  company: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(100),
  channel: z.enum(["referral", "linkedin", "company_site", "community"]),
});
const Move = z.object({ stage: z.enum(STAGES) });

type App = z.infer<typeof Create> & { id: number; stage: Stage; history: { stage: Stage; at: string }[] };

export function trackerApp(now: () => Date = () => new Date()) {
  const apps = new Map<number, App>();
  let nextId = 1;
  const app = express();
  app.use(express.json());

  app.post("/applications", (req, res) => {
    const p = Create.safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: "company, role (1–100) ו־channel חוקי" });
    const a: App = { id: nextId++, ...p.data, stage: "applied", history: [{ stage: "applied", at: now().toISOString() }] };
    apps.set(a.id, a);
    res.status(201).json(a);
  });

  app.patch("/applications/:id/stage", (req, res) => {
    const a = apps.get(Number(req.params.id));
    if (!a) return res.status(404).json({ error: "not found" });
    const p = Move.safeParse(req.body);

    if (!NEXT[a.stage].includes(p.data.stage)) return res.status(409).json({ error: `אי אפשר לעבור מ־${a.stage} ל־${p.data.stage}` });
    a.stage = p.data.stage;
    a.history.push({ stage: a.stage, at: now().toISOString() });
    res.json(a);
  });

  app.get("/stats", (req, res) => {
    const byStage = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
    for (const a of apps.values()) byStage[a.stage]++;
    res.json({ total: apps.size, byStage });
  });
  return app;
}
