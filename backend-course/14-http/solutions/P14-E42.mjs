// P14-E42: מפתח route לסטטיסטיקה
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function routeKey(method, url) {
  // נתיב שמתחיל ב־// הוא בעיני URL "כתובת בלי פרוטוקול" (host בשם orders!) — ולכן נתיב מפרקים בלי URL
  const pathname = url.startsWith("/") ? url.split("?")[0] : new URL(url).pathname;
  const parts = pathname
    .split("/")
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? ":id" : UUID.test(part) ? ":uuid" : part));
  return `${method.toUpperCase()} /${parts.join("/")}`;
}

console.log(routeKey("get", "/products/17?sort=price"));
console.log(routeKey("DELETE", "https://api.test/users/3f2c9a1e-0b7d-4c1a-9f00-2a6b8c4d5e6f/"));
console.log(routeKey("GET", "/"));
console.log(routeKey("post", "//orders/5/items/"));
console.log(routeKey("GET", "/v2/products/7a"));
