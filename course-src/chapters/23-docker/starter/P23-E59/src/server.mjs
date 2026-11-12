// P23-E59 — השרת (לא משנים). מאזין ל־PORT
import http from "node:http";

const port = Number(process.env.PORT ?? 3000);
const server = http.createServer((req, res) => {
  if (req.url === "/health") return res.writeHead(200, { "content-type": "application/json" }).end('{"ok":true}');
  res.writeHead(404).end();
});
server.listen(port, () => console.log(`listening on ${port}`));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
