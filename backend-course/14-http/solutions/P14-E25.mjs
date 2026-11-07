// P14-E25
import http from "node:http";

export function createLimitedServer({ limit, windowMs, now = Date.now }) {
  const windows = new Map();

  return http.createServer((req, res) => {
    const client = req.headers["x-client-id"] ?? "anonymous";
    const t = now();
    let w = windows.get(client);
    if (!w || t - w.start >= windowMs) {
      w = { start: t, count: 0 };
      windows.set(client, w);
    }
    w.count++;

    const headers = { "Content-Type": "application/json; charset=utf-8" };
    if (w.count > limit) {
      headers["Retry-After"] = String(Math.ceil((w.start + windowMs - t) / 1000));
      headers["X-RateLimit-Remaining"] = "0";
      res.writeHead(429, headers);
      return res.end(JSON.stringify({ error: "יותר מדי בקשות" }));
    }
    headers["X-RateLimit-Remaining"] = String(limit - w.count);
    res.writeHead(200, headers);
    res.end(JSON.stringify({ ok: true }));
  });
}
