// שרת הדגמה לפרק 14. הפעלה (מתוך ~/dev/backend-course):
//   node 14-http/files/demo-server.mjs
// ואז, בחלון Terminal אחר:  curl http://localhost:4000/products
import http from "node:http";

const PORT = Number(process.env.PORT ?? 4000);
const products = [
  { id: 1, name: "מקלדת", price: 249 },
  { id: 2, name: "עכבר", price: 89 },
];
let nextId = 3;

function send(res, status, body, headers = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(text);
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (raw === "") return undefined;
  return JSON.parse(raw);
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);
  console.log(`${req.method} ${url.pathname}${url.search}`);
  try {
    if (url.pathname === "/") {
      return send(res, 200, { message: "שלום! נסה /products" });
    }
    if (parts[0] === "products" && parts.length === 1) {
      if (req.method === "GET") {
        const max = url.searchParams.get("maxPrice");
        const list = max === null ? products : products.filter((p) => p.price <= Number(max));
        return send(res, 200, list);
      }
      if (req.method === "POST") {
        if (!req.headers["content-type"]?.includes("application/json")) {
          return send(res, 415, { error: "Content-Type חייב להיות application/json" });
        }
        const body = await readJson(req);
        if (typeof body?.name !== "string" || typeof body?.price !== "number" || body.price <= 0) {
          return send(res, 400, { error: "name (מחרוזת) ו־price (מספר חיובי) חובה" });
        }
        const product = { id: nextId++, name: body.name, price: body.price };
        products.push(product);
        return send(res, 201, product, { Location: `/products/${product.id}` });
      }
      return send(res, 405, { error: "Method Not Allowed" }, { Allow: "GET, POST" });
    }
    if (parts[0] === "products" && parts.length === 2) {
      const product = products.find((p) => p.id === Number(parts[1]));
      if (!product) return send(res, 404, { error: "המוצר לא נמצא" });
      if (req.method === "GET") return send(res, 200, product);
      if (req.method === "DELETE") {
        products.splice(products.indexOf(product), 1);
        res.writeHead(204);
        return res.end();
      }
      return send(res, 405, { error: "Method Not Allowed" }, { Allow: "GET, DELETE" });
    }
    if (url.pathname === "/slow") {
      await new Promise((r) => setTimeout(r, 3000));
      return send(res, 200, { message: "סוף סוף" });
    }
    if (url.pathname === "/flaky") {
      return Math.random() < 0.5 ? send(res, 503, { error: "נסה שוב" }) : send(res, 200, { ok: true });
    }
    if (url.pathname === "/secret") {
      if (req.headers.authorization !== "Bearer let-me-in") return send(res, 401, { error: "צריך להתחבר" });
      return send(res, 200, { secret: "🍪" });
    }
    send(res, 404, { error: "אין כתובת כזו" });
  } catch (err) {
    if (err instanceof SyntaxError) return send(res, 400, { error: "JSON לא תקין" });
    console.error(err);
    send(res, 500, { error: "שגיאה פנימית" });
  }
});

if (process.argv[1] === import.meta.filename) {
  server.listen(PORT, () => console.log(`שרת ההדגמה רץ: http://localhost:${PORT}`));
}
