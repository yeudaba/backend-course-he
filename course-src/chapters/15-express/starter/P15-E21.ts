// P15-E21: שלוש תקלות. X-Response-Time צריך להופיע בכל תשובה
import express from "express";

const products = [{ id: 1, name: "מקלדת" }];

export function createApp() {
  const app = express();

  app.use((req, res, next) => {
    const start = performance.now();
    next();
    res.set("X-Response-Time", `${Math.round(performance.now() - start)}ms`);
  });

  app.get("/products/:id", (req, res) => {
    if (Number.isNaN(Number(req.params.id))) {
      res.status(400).json({ error: "id חייב להיות מספר" });
    }
    const product = products[Number(req.params.id)];
    if (!product) {
      res.status(404).json({ error: "לא נמצא" });
      return;
    }
    res.json(product);
  });

  return app;
}
