// P29-E83: GET /ask/stream ב־Express
import express from "express";
import { z } from "zod";

const Query = z.object({ q: z.string().min(1).max(500) });

export function sseApp(streamText: (question: string, signal: AbortSignal) => AsyncIterable<string>) {
  const app = express();
  app.get("/ask/stream", async (req, res) => {
    const parsed = Query.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "q: 1–500 תווים" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const ac = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) ac.abort();
    });

    try {
      for await (const text of streamText(parsed.data.q, ac.signal)) {
        if (ac.signal.aborted) break;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
      if (!ac.signal.aborted) res.write("event: done\ndata: {}\n\n");
    } catch {
      if (!ac.signal.aborted) res.write(`event: error\ndata: ${JSON.stringify({ error: "ai_failed" })}\n\n`);
    }
    res.end();
  });
  return app;
}
