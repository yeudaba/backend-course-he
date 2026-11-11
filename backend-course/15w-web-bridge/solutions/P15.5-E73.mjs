// P15.5-E73: API עם CORS — ראשון ונכון
import express from "express";
import cors from "cors";

export function createApp({ corsOrigins = ["http://localhost:5500"] } = {}) {
  const app = express();
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());
  app.use((req, res, next) => {
    if (req.get("x-api-key") !== "demo-key") {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "חסר מפתח" } });
      return;
    }
    next();
  });

  const tasks = [];
  app.get("/tasks", (req, res) => {
    res.json(tasks);
  });
  app.post("/tasks", (req, res) => {
    const title = req.body?.title;
    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "title חובה" } });
      return;
    }
    const task = { id: tasks.length + 1, title: title.trim() };
    tasks.push(task);
    res.status(201).json(task);
  });
  return app;
}

const server = createApp().listen(0, async () => {
  const url = `http://localhost:${server.address().port}/tasks`;
  const pre = await fetch(url, {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5500", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,x-api-key" },
  });
  console.log("preflight:", pre.status, pre.headers.get("access-control-allow-origin"), pre.headers.get("access-control-allow-headers"));
  const post = await fetch(url, { method: "POST", headers: { Origin: "http://localhost:5500", "Content-Type": "application/json", "x-api-key": "demo-key" }, body: '{"title":"חלב"}' });
  console.log("POST:", post.status, post.headers.get("access-control-allow-origin"), await post.text());
  const evil = await fetch(url, { headers: { Origin: "https://evil.example", "x-api-key": "demo-key" } });
  console.log("זר:", evil.status, evil.headers.get("access-control-allow-origin"));
  server.close();
});
