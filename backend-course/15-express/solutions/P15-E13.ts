// P15-E13
import express from "express";
import { z } from "zod";

export function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
  };
}

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export function createApp(products: unknown[]) {
  const app = express();
  app.get("/products", (req, res) => {
    const q = querySchema.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "קלט לא תקין",
          details: q.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      });
      return;
    }
    res.json(paginate(products, q.data.page, q.data.limit));
  });
  return app;
}
