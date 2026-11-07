// P15-E14
import express from "express";
import { z } from "zod";

interface Product {
  id: number;
  name: string;
  price: number;
}

const querySchema = z
  .object({
    q: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(["price", "-price", "name", "-name"]).optional(),
  })
  .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
    message: "minPrice גדול מ־maxPrice",
    path: ["minPrice"],
  });

const comparators = {
  price: (a: Product, b: Product) => a.price - b.price,
  name: (a: Product, b: Product) => a.name.localeCompare(b.name),
};

export function createApp(products: Product[]) {
  const app = express();
  app.get("/products", (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "קלט לא תקין",
          details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      });
      return;
    }
    const { q, minPrice, maxPrice, sort } = parsed.data;
    let list = products.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
        (minPrice === undefined || p.price >= minPrice) &&
        (maxPrice === undefined || p.price <= maxPrice)
    );
    if (sort) {
      const desc = sort.startsWith("-");
      const compare = comparators[desc ? (sort.slice(1) as "price" | "name") : (sort as "price" | "name")];
      list = [...list].sort((a, b) => (desc ? -compare(a, b) : compare(a, b)));
    } else {
      list = [...list].sort((a, b) => a.id - b.id);
    }
    res.json(list);
  });
  return app;
}
