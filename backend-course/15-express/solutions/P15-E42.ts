// P15-E42: מחלקת אחסון מוזרקת
import express from "express";

export type Note = { id: number; text: string; createdAt: string };

export class NotesStore {
  #notes = new Map<number, Note>();
  #nextId = 1;

  add(text: string): Note {
    const note = { id: this.#nextId++, text, createdAt: new Date().toISOString() };
    this.#notes.set(note.id, note);
    return note;
  }
  get(id: number): Note | undefined {
    return this.#notes.get(id);
  }
  list(): Note[] {
    return [...this.#notes.values()].sort((a, b) => a.id - b.id);
  }
  remove(id: number): boolean {
    return this.#notes.delete(id);
  }
}

export function createApp(store = new NotesStore()) {
  const app = express();
  app.use(express.json());

  app.get("/notes", (req, res) => {
    res.json(store.list());
  });

  app.post("/notes", (req, res) => {
    const text = req.body?.text;
    if (typeof text !== "string" || text.trim().length < 1 || text.trim().length > 200) {
      res.status(400).json({ error: "text לא תקין" });
      return;
    }
    const note = store.add(text.trim());
    res.status(201).location(`/notes/${note.id}`).json(note);
  });

  app.get("/notes/:id", (req, res) => {
    const note = store.get(Number(req.params.id));
    if (!note) {
      res.status(404).json({ error: "לא נמצא" });
      return;
    }
    res.json(note);
  });

  app.delete("/notes/:id", (req, res) => {
    if (!store.remove(Number(req.params.id))) {
      res.status(404).json({ error: "לא נמצא" });
      return;
    }
    res.sendStatus(204);
  });

  return app;
}

const store = new NotesStore();
store.add("פתק מוכן");
const server = createApp(store).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}/notes`;
  const created = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"text":"  לקנות חלב  "}' });
  console.log(created.status, created.headers.get("location"));
  console.log(store.list().map((n) => n.text));
  console.log((await fetch(`${base}/1`, { method: "DELETE" })).status, (await fetch(`${base}/1`)).status);
  server.close();
});
