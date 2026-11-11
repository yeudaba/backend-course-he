// P15-E26: API משימות מאפס
import express, { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

type Task = { id: number; title: string; done: boolean };

const newTaskSchema = z.object({
  title: z.string().trim().min(1).max(100),
  done: z.boolean().default(false),
});

export function createApp() {
  const app = express();
  app.use(express.json());
  const tasks: Task[] = [];
  let nextId = 1;

  const findTask = (id: string) => tasks.find((t) => t.id === Number(id));

  app.get("/tasks", (req, res) => {
    const { done } = req.query;
    if (done === "true" || done === "false") {
      res.json(tasks.filter((t) => t.done === (done === "true")));
      return;
    }
    res.json(tasks);
  });

  app.get("/tasks/:id", (req, res) => {
    const task = findTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: "המשימה לא נמצאה" });
      return;
    }
    res.json(task);
  });

  app.post("/tasks", (req, res) => {
    const result = newTaskSchema.safeParse(req.body);
    if (!result.success) {
      const fields = [...new Set(result.error.issues.map((i) => i.path.join(".")))];
      res.status(400).json({ error: "קלט לא תקין", fields });
      return;
    }
    const task = { id: nextId++, ...result.data };
    tasks.push(task);
    res.status(201).location(`/tasks/${task.id}`).json(task);
  });

  app.delete("/tasks/:id", (req, res) => {
    const task = findTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: "המשימה לא נמצאה" });
      return;
    }
    tasks.splice(tasks.indexOf(task), 1);
    res.sendStatus(204);
  });

  app.use((err: { type?: string }, req: Request, res: Response, next: NextFunction) => {
    if (err.type === "entity.parse.failed") {
      res.status(400).json({ error: "JSON לא תקין" });
      return;
    }
    next(err);
  });

  return app;
}

// הדגמה: מפעילים על פורט פנוי, שולחים כמה בקשות וסוגרים
const server = createApp().listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const post = (body: unknown) => fetch(`${base}/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const created = await post({ title: "  לקנות חלב " });
  console.log(created.status, created.headers.get("location"), await created.json());
  const bad = await post({ title: "", done: "yes" });
  console.log(bad.status, await bad.json());
  console.log((await fetch(`${base}/tasks?done=false`).then((r) => r.json())).length);
  server.close();
});
