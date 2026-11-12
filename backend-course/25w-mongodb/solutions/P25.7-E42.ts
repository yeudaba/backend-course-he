// P25.7-E42: GET /products/:id ב־Express
import { Router } from "express";
import type { Db } from "mongodb";

type Product = { _id: string; name: string; category: string; price: number; stock: number };
const projection = { name: 1, category: 1, price: 1, stock: 1 };
const toDto = (p: Product) => ({ id: p._id, name: p.name, category: p.category, price: p.price, inStock: p.stock > 0 });

export function productsRouter(db: Db) {
  const products = db.collection<Product>("products");
  const router = Router();
  router.get("/products/:id", async (req, res) => {
    const p = await products.findOne({ _id: req.params.id }, { projection });
    if (!p) {
      res.status(404).json({ error: { code: "NOT_FOUND" } });
      return;
    }
    res.json(toDto(p));
  });
  router.get("/products", async (req, res) => {
    const filter = typeof req.query.category === "string" ? { category: req.query.category } : {};
    res.json((await products.find(filter, { projection }).sort({ name: 1 }).toArray()).map(toDto));
  });
  return router;
}
