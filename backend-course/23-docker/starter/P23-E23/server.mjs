// P23-E23: "אצלי זה עובד" (node server.mjs ← curl localhost:3000/health ...), אבל מתוך Docker — לא
import http from "node:http";

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "127.0.0.1";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, node: process.version }));
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(port, host, () => console.log(`listening on ${host}:${port}`));

// docker stop שולח SIGTERM — סוגרים יפה, ולא מחכים 10 שניות ל־SIGKILL
process.on("SIGTERM", () => server.close(() => process.exit(0)));
