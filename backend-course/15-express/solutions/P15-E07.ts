// P15-E07
import express from "express";

export interface Product {
  id: number;
  name: string;
  price: number;
}

export function createApp(products: Product[]) {
  const app = express();

  app.get("/products", (req, res) => {
    const max = req.query.maxPrice;
    res.json(typeof max === "string" ? products.filter((p) => p.price <= Number(max)) : products);
  });

  app.get("/products/:id", (req, res) => {
    const product = products.find((p) => p.id === Number(req.params.id));
    if (!product) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "המוצר לא נמצא" } });
      return;
    }
    res.json(product);
  });

  return app;
}
