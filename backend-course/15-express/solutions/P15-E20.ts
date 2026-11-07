// P15-E20: מתוקן — רק הסדר השתנה
import express, { type Request, type Response, type NextFunction } from "express";

export function createApp() {
  const app = express();
  const tasks: { id: number; title: string }[] = [];

  app.use(express.json());

  app.get("/tasks", (req, res) => {
    res.json(tasks);
  });
  app.post("/tasks", (req, res) => {
    const task = { id: tasks.length + 1, title: String(req.body.title) };
    tasks.push(task);
    res.status(201).json(task);
  });
  app.get("/tasks/boom", () => {
    throw new Error("באג");
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "לא נמצא" } });
  });

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה פנימית" } });
  });

  return app;
}
