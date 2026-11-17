// P15-E40: חיפוש לפי מק"ט עם Map
import express from "express";

export type Product = { sku: string; name: string; price: number };

export function createApp(products: Product[]) {
  const app = express();
  const bySku = new Map(products.map((p) => [p.sku.toUpperCase(), p]));

  app.get("/products/by-sku", (req, res) => {
    const list = String(req.query.skus ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      res.status(400).json({ error: "חסר skus" });
      return;
    }
    const seen = new Set<string>();
    const found: Product[] = [];
    const missing: string[] = [];
    for (const sku of list) {
      const key = sku.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const product = bySku.get(key);
      if (product) found.push(product);
      else missing.push(sku);
    }
    res.json({ found, missing });
  });

  app.get("/products/by-sku/:sku", (req, res) => {
    const product = bySku.get(req.params.sku.toUpperCase());
    if (!product) {
      res.status(404).json({ error: `לא נמצא: ${req.params.sku}` });
      return;
    }
    res.json(product);
  });

  return app;
}

const server = createApp([
  { sku: "PEN-1", name: "עט", price: 450 },
  { sku: "CUP-2", name: "כוס", price: 1990 },
]).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  for (const path of ["/products/by-sku/pen-1", "/products/by-sku/x", "/products/by-sku?skus=cup-2, PEN-1,nope,Cup-2", "/products/by-sku"]) {
    const res = await fetch(base + path);
    console.log(res.status, await res.text());
  }
  server.close();
});
