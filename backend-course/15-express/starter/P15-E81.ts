// P15-E81: מוצרים — GET /products/1 תמיד 404, ‏/products/cheap "לא נמצא", ו־POST מחזיר 500.
// שלוש תקלות. מצא ותקן.
//
// בדיקה:  npm run check P15-E81
import express from "express";

export function createApp() {
  const app = express();
  const products = [
    { id: 1, name: "אספרסו", price: 9 },
    { id: 2, name: "קפוצ׳ינו", price: 14 },
    { id: 3, name: "עוגייה", price: 6 },
  ];
  let nextId = 4;

  app.get("/products/:id", (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: "המוצר לא נמצא" });
      return;
    }
    res.json(product);
  });

  app.get("/products/cheap", (req, res) => {
    res.json(products.filter((p) => p.price < 10));
  });

  app.post("/products", (req, res) => {
    const { name, price } = req.body;
    const product = { id: nextId++, name, price };
    products.push(product);
    res.status(201).json(product);
  });

  return app;
}
