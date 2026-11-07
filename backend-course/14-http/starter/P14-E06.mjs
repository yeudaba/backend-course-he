// P14-E06
// parseUrl("http://localhost:4000/products?maxPrice=100")
//   → { protocol: "http", host: "localhost", port: 4000, path: "/products", query: { maxPrice: "100" } }
// port חסר → 80 / 443 / null | כתובת לא תקינה → Error(`כתובת לא תקינה: ${text}`)
export function parseUrl(text) {
  // כתוב כאן
}
