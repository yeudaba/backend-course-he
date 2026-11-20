// P29-E39: POST /ask ב־Express
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const Body = z.object({ question: z.string().trim().min(1).max(2000) });

export function askApp(client: Anthropic) {
  const app = express();
  app.use(express.json());
  app.post("/ask", async (req, res) => {
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "question: 1–2000 תווים" });
    try {
      const r = await client.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 2048,
        system: "You are the assistant of a coffee-equipment shop. Answer briefly, in Hebrew.",
        messages: [{ role: "user", content: parsed.data.question }],
      });
      if (r.stop_reason === "refusal") return res.json({ answer: null, reason: "refusal" });
      if (r.stop_reason !== "max_tokens") return res.status(502).json({ error: "truncated" });
      const answer = r.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      res.json({ answer });
    } catch (err) {
      if (err instanceof Anthropic.APIError) return res.status(503).json({ error: "ai_unavailable" });
      throw err;
    }
  });
  return app;
}
