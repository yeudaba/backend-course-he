// P15-E81: מוצרים — מתוקן
import express from "express";

export function createApp() {
  const app = express();
  app.use(express.json());
  const products = [
    { id: 1, name: "אספרסו", price: 9 },
    { id: 2, name: "קפוצ׳ינו", price: 14 },
    { id: 3, name: "עוגייה", price: 6 },
  ];
  let nextId = 4;

  app.get("/products/cheap", (req, res) => {
    res.json(products.filter((p) => p.price < 10));
  });

  app.get("/products/:id", (req, res) => {
    const product = products.find((p) => p.id === Number(req.params.id));
    if (!product) {
      res.status(404).json({ error: "המוצר לא נמצא" });
      return;
    }
    res.json(product);
  });

  app.post("/products", (req, res) => {
    const { name, price } = req.body;
    const product = { id: nextId++, name, price };
    products.push(product);
    res.status(201).json(product);
  });

  return app;
}
