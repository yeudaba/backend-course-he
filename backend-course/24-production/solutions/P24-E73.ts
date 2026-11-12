// P24-E73: PUT עם מזהה מהלקוח
import { Router } from "express";

type Note = { id: string; text: string; version: number };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function notesRouter() {
  const notes = new Map<string, Note>();
  const router = Router();
  const fail = (code: string, message: string) => ({ error: { code, message } });

  router.put("/notes/:id", (req, res) => {
    const { id } = req.params;
    if (!UUID.test(id)) {
      res.status(400).json(fail("INVALID_ID", "המזהה חייב להיות UUID"));
      return;
    }
    const raw = req.body?.text;
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text) {
      res.status(400).json(fail("VALIDATION_ERROR", "text חייב להיות מחרוזת לא ריקה"));
      return;
    }
    const existing = notes.get(id);
    if (!existing) {
      const note = { id, text, version: 1 };
      notes.set(id, note);
      res.status(201).location(`/notes/${id}`).json(note);
      return;
    }
    if (existing.text !== text) {
      existing.text = text;
      existing.version += 1;
    }
    res.json(existing); // אותו תוכן ← אותו מצב, בלי שינוי
  });

  router.get("/notes/:id", (req, res) => {
    const note = notes.get(req.params.id);
    if (!note) {
      res.status(404).json(fail("NOT_FOUND", "הפתק לא נמצא"));
      return;
    }
    res.json(note);
  });
  return router;
}
