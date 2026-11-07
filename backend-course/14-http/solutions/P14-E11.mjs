// P14-E11
import http from "node:http";

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(body));
}

const routes = {
  "/": () => ({ message: "שלום" }),
  "/time": () => ({ now: new Date().toISOString() }),
};

export function createHelloServer() {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    const route = routes[pathname];
    if (!route) return send(res, 404, { error: "לא נמצא" });
    if (req.method !== "GET") return send(res, 405, { error: "Method Not Allowed" }, { Allow: "GET" });
    send(res, 200, route());
  });
}
