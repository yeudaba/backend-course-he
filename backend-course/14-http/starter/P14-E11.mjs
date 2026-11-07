// P14-E11
// createHelloServer() → http.Server (בלי listen!)
// GET / → 200 { message: "שלום" } | GET /time → 200 { now: ISO } | method אחר → 405 + Allow: GET | אחר → 404
import http from "node:http";

export function createHelloServer() {
  // כתוב כאן: return http.createServer((req, res) => { ... });
}
