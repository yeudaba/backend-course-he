// P15-E35: מונים בשם
import express from "express";

export function createApp() {
  const app = express();
  app.use(express.json());
  const counters = new Map<string, number>();

  app.post("/counters/:name/increment", (req, res) => {
    const { name } = req.params;
    const by = req.body?.by ?? 1;
    if (!Number.isInteger(by) || by < 1 || by > 100) {
      res.status(400).json({ error: "by חייב להיות מספר שלם 1–100" });
      return;
    }
    const value = (counters.get(name) ?? 0) + by;
    counters.set(name, value);
    res.json({ name, value });
  });

  app.get("/counters/:name", (req, res) => {
    const { name } = req.params;
    res.json({ name, value: counters.get(name) ?? 0 });
  });

  app.delete("/counters/:name", (req, res) => {
    if (!counters.delete(req.params.name)) {
      res.status(404).json({ error: "אין מונה כזה" });
      return;
    }
    res.sendStatus(204);
  });

  return app;
}

const server = createApp().listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}/counters`;
  const inc = (name: string, body?: unknown) =>
    fetch(`${base}/${name}/increment`, { method: "POST", headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
  for (const res of [await inc("visits"), await inc("visits", { by: 5 }), await inc("visits", { by: "5" }), await fetch(`${base}/visits`), await fetch(`${base}/visits`, { method: "DELETE" }), await fetch(`${base}/visits`, { method: "DELETE" })]) {
    console.log(res.status, await res.text());
  }
  server.close();
});
