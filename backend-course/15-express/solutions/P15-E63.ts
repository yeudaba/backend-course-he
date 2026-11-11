// P15-E63: משאב מקונן ב־Router
import express, { Router, type Request, type Response } from "express";

export type Task = { id: number; title: string };
export type Comment = { id: number; text: string };
export type Service = {
  getTask(id: number): Task | undefined;
  listComments(taskId: number): Comment[];
  addComment(taskId: number, text: string): Comment;
};

export function createTasksRouter(service: Service) {
  const router = Router();
  router.use(express.json());

  function findTask(req: Request, res: Response): Task | undefined {
    const raw = String(req.params.id);
    const task = /^\d+$/.test(raw) && Number(raw) > 0 ? service.getTask(Number(raw)) : undefined;
    if (!task) res.status(404).json({ error: { code: "TASK_NOT_FOUND", message: "המשימה לא נמצאה" } });
    return task;
  }

  router.get("/:id", (req, res) => {
    const task = findTask(req, res);
    if (task) res.json(task);
  });

  router.get("/:id/comments", (req, res) => {
    const task = findTask(req, res);
    if (task) res.json({ data: service.listComments(task.id) });
  });

  router.post("/:id/comments", (req, res) => {
    const task = findTask(req, res);
    if (!task) return;
    const text = req.body?.text;
    if (typeof text !== "string" || text.trim().length < 1 || text.trim().length > 500) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "text לא תקין" } });
      return;
    }
    const comment = service.addComment(task.id, text.trim());
    res.status(201).location(`${req.baseUrl}/${task.id}/comments/${comment.id}`).json(comment);
  });

  return router;
}

const comments: Comment[] = [];
const service: Service = {
  getTask: (id) => (id === 7 ? { id: 7, title: "לקנות חלב" } : undefined),
  listComments: () => comments,
  addComment: (taskId, text) => {
    const c = { id: comments.length + 1, text };
    comments.push(c);
    return c;
  },
};
const app = express();
app.use("/tasks", createTasksRouter(service));
const server = app.listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const post = await fetch(`${base}/tasks/7/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"text":" עם 3% "}' });
  console.log(post.status, post.headers.get("location"), await post.text());
  for (const path of ["/tasks/7/comments", "/tasks/8/comments", "/tasks/abc"]) {
    const res = await fetch(base + path);
    console.log(path, res.status, await res.text());
  }
  server.close();
});
