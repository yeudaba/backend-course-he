// P15-E17
import express, { type Response } from "express";
import { z } from "zod";

const updateSchema = z
  .strictObject({
    title: z.string().trim().min(1).max(100),
    done: z.boolean(),
    priority: z.enum(["low", "medium", "high"]),
  })
  .partial()
  .refine((o) => Object.keys(o).length > 0, "צריך לפחות שדה אחד");

const idSchema = z.coerce.number().int().positive();

function badRequest(res: Response, issues: z.core.$ZodIssue[]) {
  const details = issues.map((i) => ({ path: i.path.join("."), message: i.message }));
  res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details } });
}

export function createApp() {
  const app = express();
  app.use(express.json());
  const tasks = [
    { id: 1, title: "לקנות חלב", done: false, priority: "medium" },
    { id: 2, title: "לסיים את פרק 15", done: false, priority: "high" },
  ];

  app.patch("/tasks/:id", (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) return badRequest(res, id.error.issues);
    const body = updateSchema.safeParse(req.body);
    if (!body.success) return badRequest(res, body.error.issues);
    const task = tasks.find((t) => t.id === id.data);
    if (!task) {
      res.status(404).json({ error: { code: "TASK_NOT_FOUND", message: "המשימה לא נמצאה" } });
      return;
    }
    Object.assign(task, body.data);
    res.json(task);
  });

  return app;
}
