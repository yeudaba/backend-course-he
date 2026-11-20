// P14-E83: איזה status — מתוקן
export function checkRequest(method, urlText) {
  const url = new URL(urlText);
  const parts = url.pathname.split("/").filter(Boolean); // "/products/7" ← ["products", "7"]
  if (parts[0] !== "products" || parts.length > 2) return 404;
  const isItem = parts.length === 2;
  const allowed = isItem ? ["GET", "DELETE"] : ["GET", "POST"];
  if (!allowed.includes(method)) return 405;
  const maxPrice = url.searchParams.get("maxPrice");
  if (maxPrice !== null && (maxPrice.trim() === "" || !(Number(maxPrice) >= 0))) return 400;
  if (method === "POST") return 201;
  if (method === "DELETE") return 204;
  return 200;
}

console.log(checkRequest("PUT", "http://localhost:4000/products"));
console.log(checkRequest("GET", "http://localhost:4000/products?maxPrice=abc"));
console.log(checkRequest("POST", "http://localhost:4000/products"));
