// P22-E95 — הקוד שבודקים (לא משנים אותו)
import express from "express";

const TOKENS: Record<string, { id: number; role: "user" | "admin" }> = {
  dana: { id: 1, role: "user" },
  yossi: { id: 2, role: "user" },
  admin: { id: 3, role: "admin" },
};

export function createApp() {
  const app = express();
  app.use(express.json());
  const notes: { id: number; ownerId: number; text: string }[] = [];
  let nextId = 1;

  app.use((req, res, next) => {
    const m = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "");
    const user = m ? TOKENS[m[1]] : undefined;
    if (!user) return res.status(401).json({ code: "UNAUTHORIZED" });
    res.locals.user = user;
    next();
  });

  app.post("/notes", (req, res) => {
    const note = { id: nextId++, ownerId: res.locals.user.id, text: String(req.body?.text ?? "") };
    notes.push(note);
    res.status(201).json({ id: note.id, text: note.text });
  });
  app.get("/notes", (req, res) => {
    res.json(notes.filter((n) => n.ownerId === res.locals.user.id).map(({ id, text }) => ({ id, text })));
  });
  const mine = (req: express.Request, res: express.Response) => notes.find((n) => n.id === Number(req.params.id) && n.ownerId === res.locals.user.id);
  app.get("/notes/:id", (req, res) => {
    const n = mine(req, res);
    if (!n) return res.status(404).json({ code: "NOTE_NOT_FOUND" });
    res.json({ id: n.id, text: n.text });
  });
  app.delete("/notes/:id", (req, res) => {
    const n = mine(req, res);
    if (!n) return res.status(404).json({ code: "NOTE_NOT_FOUND" });
    notes.splice(notes.indexOf(n), 1);
    res.status(204).end();
  });
  app.get("/users", (req, res) => {
    if (res.locals.user.role !== "admin") return res.status(403).json({ code: "FORBIDDEN" });
    res.json(Object.values(TOKENS).map(({ id, role }) => ({ id, role })));
  });
  return app;
}
