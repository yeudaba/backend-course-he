// P22-E14 — הקוד שבודקים (לא משנים אותו)
import express from "express";

interface Item {
  id: number;
  name: string;
}

export function createApp() {
  const app = express();
  app.use(express.json());
  const items: Item[] = [];
  let nextId = 1;

  app.get("/items", (req, res) => {
    res.json(items);
  });

  app.post("/items", (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (name.length < 1 || name.length > 50) {
      res.status(400).json({ error: "name: 1–50 תווים" });
      return;
    }
    const item = { id: nextId++, name };
    items.push(item);
    res.status(201).location(`/items/${item.id}`).json(item);
  });

  app.get("/items/:id", (req, res) => {
    const item = items.find((i) => i.id === Number(req.params.id));
    if (!item) {
      res.status(404).json({ error: "לא נמצא" });
      return;
    }
    res.json(item);
  });

  app.delete("/items/:id", (req, res) => {
    const index = items.findIndex((i) => i.id === Number(req.params.id));
    if (index === -1) {
      res.status(404).json({ error: "לא נמצא" });
      return;
    }
    items.splice(index, 1);
    res.status(204).end();
  });

  return app;
}
