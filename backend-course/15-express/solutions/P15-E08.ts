// P15-E08
import express, { type Request, type Response, type NextFunction } from "express";

export function createApp() {
  const app = express();
  app.use(express.json());
  const products: { id: number; name: string; price: number }[] = [];
  let nextId = 1;

  app.get("/products", (req, res) => {
    res.json(products);
  });

  app.post("/products", (req, res) => {
    const { name, price } = req.body ?? {};
    if (typeof name !== "string" || name.trim() === "" || typeof price !== "number" || !(price > 0)) {
      res.status(400).json({ error: "name (מחרוזת) ו־price (מספר חיובי) חובה" });
      return;
    }
    const product = { id: nextId++, name: name.trim(), price };
    products.push(product);
    res.status(201).location(`/products/${product.id}`).json(product);
  });

  app.delete("/products/:id", (req, res) => {
    const index = products.findIndex((p) => p.id === Number(req.params.id));
    if (index === -1) {
      res.status(404).json({ error: "המוצר לא נמצא" });
      return;
    }
    products.splice(index, 1);
    res.sendStatus(204);
  });

  app.use((err: { type?: string }, req: Request, res: Response, next: NextFunction) => {
    if (err.type === "entity.parse.failed") {
      res.status(400).json({ error: "JSON לא תקין" });
      return;
    }
    next(err);
  });

  return app;
}
