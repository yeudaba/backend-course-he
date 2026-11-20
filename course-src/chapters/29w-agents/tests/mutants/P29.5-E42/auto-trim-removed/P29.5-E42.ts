// P29.5-E42: POST /agent עם deadline
import express from "express";
import { z } from "zod";

type Run = (prompt: string, signal: AbortSignal) => Promise<{ status: "done"; text: string } | { status: "max_steps" }>;
const Body = z.object({ prompt: z.string().min(1).max(4000) });

export function agentApp(run: Run, opts: { timeoutMs: number }) {
  const app = express();
  app.use(express.json());
  app.post("/agent", async (req, res) => {
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "prompt: 1–4000 תווים" });

    const send = (status: number, body: unknown) => {
      if (!res.headersSent) res.status(status).json(body);
    };
    const ac = new AbortController();
    const timer = setTimeout(() => {
      ac.abort();
      send(504, { error: "timeout" });
    }, opts.timeoutMs);
    res.on("close", () => {
      if (!res.writableEnded) ac.abort();
    });

    try {
      const r = await run(parsed.data.prompt, ac.signal);
      if (r.status === "done") send(200, { status: "done", text: r.text });
      else send(200, { status: "handed_off", text: "לא הצלחתי להשלים — העברתי לנציג" });
    } catch {
      send(500, { error: "agent_failed" });
    } finally {
      clearTimeout(timer);
    }
  });
  return app;
}
