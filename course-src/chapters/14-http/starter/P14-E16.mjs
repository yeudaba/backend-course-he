// P14-E16
// const r = createRouter(); r.add("GET", "/products/:id", h);
// r.match("GET", "/products/7") → { status: 200, handler: h, params: { id: "7" } }
// r.match("PUT", "/products/7") → { status: 405, allow: ["GET"] } | שום דבר → { status: 404 }
export function createRouter() {
  // כתוב כאן
}
