// P22-E57 — הקוד שבודקים (לא משנים אותו)
import express from "express";

export function createApp() {
  const app = express();
  app.use(express.json());
  const items = new Map<number, { id: number; name: string }>();
  let nextId = 1;

  app.post("/items", (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (name.length < 1 || name.length > 50) return res.status(400).json({ error: "name חייב להיות 1–50 תווים" });
    const item = { id: nextId++, name };
    items.set(item.id, item);
    res.status(201).location(`/items/${item.id}`).json(item);
  });

  app.get("/items/:id", (req, res) => {
    const item = items.get(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "לא נמצא" });
    res.json(item);
  });

  app.delete("/items/:id", (req, res) => {
    if (!items.delete(Number(req.params.id))) return res.status(404).json({ error: "לא נמצא" });
    res.status(204).end();
  });

  return app;
}
