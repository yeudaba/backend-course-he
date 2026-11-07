// API לדוגמה לתרגיל P15.5-E10. הפעלה (מתוך ~/dev/backend-course):
//   node 15w-web-bridge/files/products-api.mjs   ← http://localhost:4100/products?q=קפה
import express from "express";
import cors from "cors";

const products = [
  { id: 1, name: "פולי קפה — אתיופיה", price: 68 },
  { id: 2, name: "פולי קפה — קולומביה", price: 62 },
  { id: 3, name: "מטחנת קפה ידנית", price: 189 },
  { id: 4, name: "פרנץ' פרס", price: 119 },
  { id: 5, name: "כוס קרמיקה", price: 39 },
  { id: 6, name: "מסנני נייר (100)", price: 25 },
];

const app = express();
app.use(cors({ origin: ["http://localhost:5500"] }));
app.get("/products", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  await new Promise((r) => setTimeout(r, 300)); // כדי שיהיה מה לראות ב"טוען..."
  res.json(products.filter((p) => p.name.includes(q)));
});
app.listen(4100, () => console.log("products-api: http://localhost:4100/products"));
