// P15-E22: מתוקן
import express from "express";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const products = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, name: `מוצר ${i + 1}` }));

export function createApp() {
  const app = express();

  app.use("/products", (req, res, next) => {
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details } });
      return;
    }
    res.locals.query = result.data;
    next();
  });

  app.get("/products", (req, res) => {
    const { page, limit } = res.locals.query as z.infer<typeof querySchema>;
    const start = (page - 1) * limit;
    res.json({ data: products.slice(start, start + limit), meta: { page, limit, total: products.length } });
  });

  return app;
}
