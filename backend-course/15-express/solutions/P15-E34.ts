// P15-E34: X-Total-Count ובחירת שדות
import express from "express";

export type Product = { id: number; name: string; price: number; stock: number };
const KNOWN = ["id", "name", "price", "stock"];

export function createApp(products: Product[]) {
  const app = express();
  app.get("/products", (req, res) => {
    res.set("X-Total-Count", String(products.length));
    if (req.query.fields === undefined) {
      res.json(products);
      return;
    }
    const fields = String(req.query.fields)
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    const unknown = fields.find((f) => !KNOWN.includes(f));
    if (unknown) {
      res.status(400).json({ error: `שדה לא מוכר: ${unknown}` });
      return;
    }
    const picked = ["id", ...fields.filter((f) => f !== "id")];
    res.json(products.map((p) => Object.fromEntries(picked.map((f) => [f, p[f as keyof Product]]))));
  });
  return app;
}

const products = [
  { id: 1, name: "מקלדת", price: 249, stock: 3 },
  { id: 2, name: "עכבר", price: 89, stock: 0 },
];
const server = createApp(products).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  for (const q of ["", "?fields=price, name", "?fields=name,password"]) {
    const res = await fetch(`${base}/products${q}`);
    console.log(res.status, res.headers.get("x-total-count"), await res.text());
  }
  server.close();
});
