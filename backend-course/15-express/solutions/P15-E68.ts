// P15-E68: רשימה עם meta וקישורים
import express from "express";

export type Product = { id: number; name: string; price: number };

const int = (v: unknown, def: number) => (v === undefined ? def : typeof v === "string" && /^\d+$/.test(v) ? Number(v) : NaN);

export function createApp(products: Product[]) {
  const app = express();
  app.get("/products", (req, res) => {
    const page = int(req.query.page, 1);
    const limit = int(req.query.limit, 10);
    if (!(page >= 1) || !(limit >= 1 && limit <= 50)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "page או limit לא תקינים" } });
      return;
    }
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const list = q === undefined ? products : products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const link = (p: number) => {
      const params = new URLSearchParams();
      if (q !== undefined) params.set("q", q);
      params.set("page", String(p));
      params.set("limit", String(limit));
      return `/products?${params}`;
    };
    res.json({
      data: list.slice((page - 1) * limit, page * limit),
      meta: { page, limit, total, totalPages },
      links: { self: link(page), next: page < totalPages ? link(page + 1) : null, prev: page > 1 ? link(page - 1) : null },
    });
  });
  return app;
}

const products = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: i % 2 ? `Mouse ${i + 1}` : `Keyboard ${i + 1}`, price: 100 + i }));
const server = createApp(products).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const r = await (await fetch(`${base}/products?q=mouse&page=2&limit=2`)).json();
  console.log(r.data.map((p: Product) => p.id), JSON.stringify(r.meta));
  console.log(JSON.stringify(r.links));
  console.log((await fetch(`${base}/products?limit=0`)).status);
  server.close();
});
