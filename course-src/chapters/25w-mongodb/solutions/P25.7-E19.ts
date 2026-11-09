// P25.7-E19
import express from "express";
import { ObjectId, type Db } from "mongodb";

export function notesRouter(db: Db) {
  const notes = db.collection("notes");
  const router = express.Router();

  router.post("/", async (req, res) => {
    const text = req.body?.text;
    if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "text חובה" });
    const { insertedId } = await notes.insertOne({ text: text.trim(), createdAt: new Date() });
    res.status(201).json({ id: insertedId.toHexString() }); // ללקוח — מחרוזת, לא אובייקט
  });

  router.get("/:id", async (req, res) => {
    // "abc" זה לא ObjectId: new ObjectId("abc") זורק. 400 — לא 500, ולא 404
    if (!ObjectId.isValid(req.params.id) || req.params.id.length !== 24) return res.status(400).json({ error: "מזהה לא תקין" });
    const note = await notes.findOne({ _id: new ObjectId(req.params.id) });
    if (!note) return res.status(404).json({ error: "לא נמצא" });
    res.json({ id: note._id.toHexString(), text: note.text, createdAt: note.createdAt.toISOString() });
  });

  return router;
}
