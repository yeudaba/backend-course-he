// P15-E18
import express, { type Request, type Response, type NextFunction } from "express";

export function requireApiKey(keys: Map<string, string>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.get("x-api-key");
    if (!key) {
      res.status(401).set("WWW-Authenticate", "ApiKey").json({ error: { code: "MISSING_API_KEY", message: "חסר X-Api-Key" } });
      return;
    }
    const client = keys.get(key);
    if (!client) {
      res.status(403).json({ error: { code: "INVALID_API_KEY", message: "מפתח לא מוכר" } });
      return;
    }
    res.locals.client = client;
    next();
  };
}

export function createApp(keys: Map<string, string>) {
  const app = express();
  app.get("/public", (req, res) => {
    res.json({ ok: true });
  });
  app.use("/api", requireApiKey(keys));
  app.get("/api/me", (req, res) => {
    res.json({ client: res.locals.client });
  });
  return app;
}
