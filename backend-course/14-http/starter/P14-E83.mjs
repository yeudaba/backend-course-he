// P14-E83: איזה status יחזור? — שלוש תקלות.
// 404: נתיב לא מוכר · 405: method לא מתאים · 400: maxPrice לא מספר ≥ 0 · 201 POST · 204 DELETE · 200 GET
//
// הרצה:   node 14-http/starter/P14-E83.mjs
// בדיקה:  npm run check P14-E83
export function checkRequest(method, urlText) {
  const url = new URL(urlText);
  const parts = url.pathname.split("/").filter(Boolean); // "/products/7" ← ["products", "7"]
  if (parts[0] !== "products" || parts.length > 2) return 404;
  const isItem = parts.length === 2;
  const allowed = isItem ? ["GET", "DELETE"] : ["GET", "POST"];
  if (!allowed.includes(method)) return 404;
  const maxPrice = url.searchParams.get("maxPrice");
  if (maxPrice !== null && Number(maxPrice) < 0) return 400;
  if (method === "POST") return 200;
  if (method === "DELETE") return 204;
  return 200;
}

console.log(checkRequest("PUT", "http://localhost:4000/products"));
console.log(checkRequest("GET", "http://localhost:4000/products?maxPrice=abc"));
console.log(checkRequest("POST", "http://localhost:4000/products"));
