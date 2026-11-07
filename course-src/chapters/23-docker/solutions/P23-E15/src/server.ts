// שרת ב־TypeScript: tsc ← dist/server.js
import http from "node:http";

interface Health {
  ok: boolean;
  uptime: number;
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/health") {
    const body: Health = { ok: true, uptime: Math.round(process.uptime()) };
    res.end(JSON.stringify(body));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
process.on("SIGTERM", () => server.close(() => process.exit(0)));
