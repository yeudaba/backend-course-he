// שרת עם תלות אחת (zod): GET /age?value=30 ← בודק שהגיל תקין
import http from "node:http";
import { z } from "zod";

const age = z.coerce.number().int().min(0).max(130);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  res.setHeader("Content-Type", "application/json");
  if (url.pathname === "/health") return res.end(JSON.stringify({ ok: true }));
  if (url.pathname === "/age") {
    const result = age.safeParse(url.searchParams.get("value"));
    res.statusCode = result.success ? 200 : 400;
    return res.end(JSON.stringify(result.success ? { age: result.data } : { error: "גיל לא תקין" }));
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
process.on("SIGTERM", () => server.close(() => process.exit(0)));
