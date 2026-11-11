// P15-E28: סכום עגלה
import express from "express";
import { z } from "zod";

export type Product = { name: string; price: number };

const cartSchema = z.object({
  items: z
    .array(z.object({ sku: z.string().min(1), qty: z.number().int().min(1).max(99) }))
    .min(1),
});

export function createApp(catalog: Map<string, Product>) {
  const app = express();
  app.use(express.json());

  app.post("/cart/total", (req, res) => {
    const result = cartSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "קלט לא תקין" });
      return;
    }

    // אותו sku פעמיים — מאחדים (Map שומרת על סדר ההופעה הראשונה)
    const qtyBySku = new Map<string, number>();
    for (const { sku, qty } of result.data.items) {
      qtyBySku.set(sku, (qtyBySku.get(sku) ?? 0) + qty);
    }

    const lines = [];
    for (const [sku, qty] of qtyBySku) {
      const product = catalog.get(sku);
      if (!product) {
        res.status(404).json({ error: `מוצר לא קיים: ${sku}` });
        return;
      }
      lines.push({ sku, name: product.name, qty, subtotal: product.price * qty });
    }

    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    res.json({ lines, total });
  });

  return app;
}

const catalog = new Map<string, Product>([
  ["PEN", { name: "עט", price: 450 }],
  ["CUP", { name: "כוס", price: 1990 }],
]);
const server = createApp(catalog).listen(0, async () => {
  const address = server.address();
  const url = `http://localhost:${typeof address === "object" && address ? address.port : 0}/cart/total`;
  const post = async (body: unknown) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    console.log(res.status, JSON.stringify(await res.json()));
  };
  await post({ items: [{ sku: "PEN", qty: 2 }, { sku: "CUP", qty: 1 }, { sku: "PEN", qty: 1 }] });
  await post({ items: [{ sku: "BOOK", qty: 1 }] });
  await post({ items: [] });
  server.close();
});
