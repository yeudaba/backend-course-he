// P27-E42: Express — "שם המשתמש פנוי?" ב־O(1)
import express from "express";

const norm = (s: string) => s.trim().toLowerCase();

export function usernamesApp(usernames: string[]) {
  const taken = new Set(usernames.map(norm));
  const app = express();
  app.use(express.json());
  app.get("/available", (req, res) => {
    const name = typeof req.query.name === "string" ? norm(req.query.name) : "";
    if (!name) return res.status(400).json({ error: "חסר name" });
    res.json({ available: !taken.has(name) });
  });
  app.post("/usernames", (req, res) => {
    const name = typeof req.body?.name === "string" ? norm(req.body.name) : "";
    if (!name) return res.status(400).json({ error: "חסר name" });
    if (taken.has(name)) return res.status(409).json({ error: "תפוס" });
    taken.add(name);
    res.status(201).json({ name });
  });
  return app;
}
