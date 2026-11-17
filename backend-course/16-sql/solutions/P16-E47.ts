// P16-E47: route שעובד כמו WHERE
import express from "express";

export type Product = { id: number; name: string; category: string; price: number; stock: number; is_active: boolean };

export function createApp(products: Product[]) {
  const app = express();
  app.get("/products", (req, res) => {
    const known = Object.keys(products[0] ?? {});
    const where = Object.entries(req.query).map(([col, value]) => [col, String(value)] as const);
    const unknown = where.find(([col]) => !known.includes(col));
    if (unknown) {
      res.status(400).json({ error: `column "${unknown[0]}" does not exist` });
      return;
    }
    const rows = products
      .filter((p) => where.every(([col, value]) => String(p[col as keyof Product]) === value))
      .sort((a, b) => a.id - b.id)
      .map(({ id, name, price }) => ({ id, name, price }));
    res.json(rows);
  });
  return app;
}

const products: Product[] = [
  { id: 6, name: "Electric Grinder Pro", category: "grinders", price: 649, stock: 3, is_active: true },
  { id: 5, name: "Hand Grinder", category: "grinders", price: 189, stock: 8, is_active: true },
  { id: 12, name: "Digital Scale", category: "accessories", price: 129, stock: 0, is_active: false },
];
const server = createApp(products).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}/products`;
  for (const q of ["?category=grinders", "?is_active=false", "?category=grinders&stock=3", "?colour=red"]) {
    const res = await fetch(base + q);
    console.log(q.padEnd(28), res.status, await res.text());
  }
  server.close();
});
