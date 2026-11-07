import { Router } from "express";
import { validate } from "../middleware/validate.ts";
import { createTaskSchema, idParamsSchema, listQuerySchema, updateTaskSchema } from "./tasks.schema.ts";
import type { TasksService } from "./tasks.service.ts";

export function createTasksRouter(service: TasksService) {
  const router = Router();

  router.get("/", validate({ query: listQuerySchema }), async (req, res) => {
    res.json(await service.list(res.locals.query));
  });

  // לפני /:id — אחרת "stats" היה נתפס כ־id
  router.get("/stats", async (req, res) => {
    res.json(await service.stats());
  });

  router.get("/:id", validate({ params: idParamsSchema }), async (req, res) => {
    res.json(await service.get(res.locals.params.id));
  });

  router.post("/", validate({ body: createTaskSchema }), async (req, res) => {
    const task = await service.create(req.body);
    res.status(201).location(`/tasks/${task.id}`).json(task);
  });

  router.patch("/:id", validate({ params: idParamsSchema, body: updateTaskSchema }), async (req, res) => {
    res.json(await service.update(res.locals.params.id, req.body));
  });

  router.delete("/:id", validate({ params: idParamsSchema }), async (req, res) => {
    await service.remove(res.locals.params.id);
    res.sendStatus(204);
  });

  return router;
}
