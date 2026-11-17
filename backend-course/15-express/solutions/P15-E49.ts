// P15-E49: רק JSON
import express, { type Request, type Response, type NextFunction } from "express";

const WITH_BODY = ["POST", "PUT", "PATCH"];

export function requireJson(req: Request, res: Response, next: NextFunction) {
  if (WITH_BODY.includes(req.method)) {
    const type = (req.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (type !== "application/json") {
      res.status(415).json({ error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "שלח JSON עם Content-Type: application/json" } });
      return;
    }
  }
  next();
}

const app = express();
app.use(requireJson);
app.use(express.json());
app.post("/items", (req, res) => {
  res.status(201).json(req.body);
});
const server = app.listen(0, async () => {
  const address = server.address();
  const url = `http://localhost:${typeof address === "object" && address ? address.port : 0}/items`;
  for (const type of ["application/json; charset=utf-8", "text/plain", undefined]) {
    const res = await fetch(url, { method: "POST", headers: type ? { "Content-Type": type } : {}, body: '{"a":1}' });
    console.log(String(type).padEnd(32), res.status, await res.text());
  }
  server.close();
});
