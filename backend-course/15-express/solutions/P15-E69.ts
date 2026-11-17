// P15-E69: יצירה מרובה — הכול או כלום
import express from "express";

export type Product = { id: number; name: string; price: number };

export function createApp() {
  const app = express();
  app.use(express.json());
  const products: Product[] = [];
  let nextId = 1;

  app.get("/products", (req, res) => {
    res.json(products);
  });

  app.post("/products/bulk", (req, res) => {
    const items: unknown = req.body;
    if (!Array.isArray(items) || items.length < 1 || items.length > 100) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "שלח מערך של 1–100 מוצרים" } });
      return;
    }
    const details: { index: number; message: string }[] = [];
    const seen = new Set<string>();
    items.forEach((item, index) => {
      const name = item?.name;
      if (typeof name !== "string" || name.trim() === "") return void details.push({ index, message: "name לא תקין" });
      if (!Number.isInteger(item.price) || item.price <= 0) return void details.push({ index, message: "price לא תקין" });
      const key = name.trim().toLowerCase();
      if (seen.has(key)) return void details.push({ index, message: "שם כפול" });
      seen.add(key);
    });
    if (details.length > 0) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "חלק מהמוצרים לא תקינים", details } });
      return;
    }
    const created = items.map((item) => ({ id: nextId++, name: item.name.trim(), price: item.price }));
    products.push(...created);
    res.status(201).json({ created });
  });

  return app;
}

const server = createApp().listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}/products`;
  const bulk = (body: unknown) => fetch(`${base}/bulk`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  let r = await bulk([{ name: "עט", price: 450 }, { name: "", price: 10 }, { name: "עט ", price: 5 }, { name: "דף", price: 1.5 }]);
  console.log(r.status, await r.text());
  console.log((await (await fetch(base)).json()).length);
  r = await bulk([{ name: " עט ", price: 450 }, { name: "דף", price: 20 }]);
  console.log(r.status, await r.text());
  server.close();
});
