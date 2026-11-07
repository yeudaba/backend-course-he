// P15-E21: מתוקן
import express from "express";

const products = [{ id: 1, name: "מקלדת" }];

export function createApp() {
  const app = express();

  app.use((req, res, next) => {
    const start = performance.now();
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.set("X-Response-Time", `${Math.round(performance.now() - start)}ms`);
      return originalJson(body);
    };
    next();
  });

  app.get("/products/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "id חייב להיות מספר" });
      return;
    }
    const product = products.find((p) => p.id === id);
    if (!product) {
      res.status(404).json({ error: "לא נמצא" });
      return;
    }
    res.json(product);
  });

  return app;
}
