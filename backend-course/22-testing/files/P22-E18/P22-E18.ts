// P22-E18 — הקוד שבודקים (לא משנים אותו)
// API קטן של פתקים: כניסה ← טוקן session (15 דקות), וכל משתמש רואה רק את הפתקים שלו
import { randomBytes } from "node:crypto";
import express from "express";

const USERS = [
  { id: 1, email: "dana@example.com", password: "dana-password-1" },
  { id: 2, email: "yossi@example.com", password: "yossi-password-1" },
];
const SESSION_MS = 15 * 60 * 1000;

export function createApp({ now = () => new Date() } = {}) {
  const app = express();
  app.use(express.json());
  const sessions = new Map<string, { userId: number; expiresAt: number }>();
  const notes: { id: number; ownerId: number; text: string }[] = [];
  let nextId = 1;

  app.post("/login", (req, res) => {
    const user = USERS.find((u) => u.email === req.body?.email && u.password === req.body?.password);
    if (!user) {
      res.status(401).json({ error: "אימייל או סיסמה שגויים" });
      return;
    }
    const token = randomBytes(24).toString("base64url");
    sessions.set(token, { userId: user.id, expiresAt: now().getTime() + SESSION_MS });
    res.json({ token });
  });

  // כל מה שאחרי זה — רק למחוברים
  app.use((req, res, next) => {
    const token = /^Bearer (\S+)$/.exec(req.get("authorization") ?? "")?.[1];
    const session = token ? sessions.get(token) : undefined;
    if (!session || session.expiresAt <= now().getTime()) {
      res.status(401).json({ error: "נדרשת התחברות" });
      return;
    }
    res.locals.userId = session.userId;
    next();
  });

  app.get("/notes", (req, res) => {
    res.json(notes.filter((n) => n.ownerId === res.locals.userId).map(({ id, text }) => ({ id, text })));
  });

  app.post("/notes", (req, res) => {
    const note = { id: nextId++, ownerId: res.locals.userId, text: String(req.body?.text ?? "") };
    notes.push(note);
    res.status(201).json({ id: note.id, text: note.text });
  });

  app.delete("/notes/:id", (req, res) => {
    const index = notes.findIndex((n) => n.id === Number(req.params.id) && n.ownerId === res.locals.userId);
    if (index === -1) {
      res.status(404).json({ error: "לא נמצא" });
      return;
    }
    notes.splice(index, 1);
    res.status(204).end();
  });

  return app;
}
