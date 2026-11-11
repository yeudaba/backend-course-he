// P15-E50: מצב תחזוקה
import express, { type Request, type Response, type NextFunction } from "express";

export function maintenance(isOn: () => boolean, { allow = ["/health"] }: { allow?: string[] } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isOn() || allow.includes(req.path)) {
      next();
      return;
    }
    res
      .status(503)
      .set("Retry-After", "60")
      .json({ error: { code: "MAINTENANCE", message: "השירות בתחזוקה, נסה שוב בעוד דקה" } });
  };
}

let on = false;
const app = express();
app.use(maintenance(() => on));
app.get("/health", (req, res) => {
  res.json({ ok: true });
});
app.get("/orders", (req, res) => {
  res.json([]);
});
const server = app.listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  console.log((await fetch(`${base}/orders`)).status);
  on = true;
  const r = await fetch(`${base}/orders`);
  console.log(r.status, r.headers.get("retry-after"), (await fetch(`${base}/health`)).status);
  server.close();
});
