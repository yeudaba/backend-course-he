// P14-E20: מתוקן
import http from "node:http";

const JSON_TYPE = { "Content-Type": "application/json; charset=utf-8" };

export function createServer() {
  return http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, JSON_TYPE);
      res.end(JSON.stringify({ ok: true }));
    } else if (req.url === "/users") {
      res.writeHead(200, JSON_TYPE);
      res.end(JSON.stringify([{ id: 1, name: "דנה" }]));
    } else if (req.url === "/old-users") {
      res.writeHead(301, { Location: "/users" });
      res.end();
    } else {
      res.writeHead(404, JSON_TYPE);
      res.end(JSON.stringify({ error: "לא נמצא" }));
    }
  });
}
