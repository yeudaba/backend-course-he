// P14-E20: שלושה באגים (פירוט בדף התרגילים)
import http from "node:http";

export function createServer() {
  return http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true }));
    } else if (req.url === "/users") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify([{ id: 1, name: "דנה" }]));
    } else if (req.url === "/old-users") {
      res.writeHead(301, { Location: "/users" });
    } else {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "לא נמצא" }));
    }
  });
}
