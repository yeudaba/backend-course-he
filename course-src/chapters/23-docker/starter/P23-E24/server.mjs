// שרת שסופר ביקורים ב־PostgreSQL: GET /visits ← { visits: n }
import http from "node:http";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// בעלייה: יוצרים את הטבלה. אם המסד לא זמין — יוצאים (וזה מה ש־depends_on עם healthcheck מונע)
try {
  await pool.query("CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, at TIMESTAMPTZ NOT NULL DEFAULT now())");
} catch (err) {
  console.error(`לא הצלחתי להתחבר למסד: ${err.message}`);
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/health") return res.end(JSON.stringify({ ok: true }));
  if (req.url === "/visits") {
    await pool.query("INSERT INTO visits DEFAULT VALUES");
    const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM visits");
    return res.end(JSON.stringify({ visits: rows[0].n }));
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(Number(process.env.PORT ?? 3000), "0.0.0.0", () => console.log("visits app ready"));
process.on("SIGTERM", () => server.close(() => pool.end().then(() => process.exit(0))));
