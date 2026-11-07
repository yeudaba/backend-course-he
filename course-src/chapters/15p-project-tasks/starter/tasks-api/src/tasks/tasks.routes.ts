// שלב 2. routes דקים: validate ← service ← status
import { Router } from "express";
import { validate } from "../middleware/validate.ts";
import { createTaskSchema, idParamsSchema, listQuerySchema, updateTaskSchema } from "./tasks.schema.ts";
import type { TasksService } from "./tasks.service.ts";

export function createTasksRouter(service: TasksService) {
  const router = Router();
  // כתוב כאן
  return router;
}
