// P15-E48: X-Request-Id
import express, { type Request, type Response, type NextFunction } from "express";

const VALID = /^[A-Za-z0-9-]{1,64}$/;

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.get("x-request-id");
    const id = incoming && VALID.test(incoming) ? incoming : crypto.randomUUID();
    res.locals.requestId = id;
    res.set("X-Request-Id", id);
    next();
  };
}

const app = express();
app.use(requestId());
app.get("/", (req, res) => {
  res.json({ id: res.locals.requestId });
});
const server = app.listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const a = await fetch(base, { headers: { "X-Request-Id": "abc-123" } });
  console.log(a.headers.get("x-request-id"), await a.text());
  const b = await fetch(base, { headers: { "X-Request-Id": "<script>" } });
  console.log(b.headers.get("x-request-id") === (await b.json()).id ? "UUID חדש, זהה ב־header ובגוף" : "?");
  server.close();
});
