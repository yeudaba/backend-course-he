// P15-E22: שלוש תקלות
// GET /products?page=2&limit=5 → { data, meta: { page, limit, total } } | לא תקין → 400 VALIDATION_ERROR
import express from "express";
import { z } from "zod";

const querySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

const products = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, name: `מוצר ${i + 1}` }));

export function createApp() {
  const app = express();

  app.use("/products", (req, res, next) => {
    (req as { query: unknown }).query = querySchema.parse(req.query);
    next();
  });

  app.get("/products", (req, res) => {
    const { page, limit } = req.query as unknown as z.infer<typeof querySchema>;
    const start = (page - 1) * limit;
    res.json({ data: products.slice(start, start + limit), meta: { page, limit, total: products.length } });
  });

  return app;
}
