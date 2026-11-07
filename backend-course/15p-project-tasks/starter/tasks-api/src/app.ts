// שלב 2. בונה את האפליקציה. server.ts מפעיל אותה; הבדיקות קוראות ל־createApp ישירות.
import express from "express";
import { errorHandler, notFound } from "./errors.ts";
import { logger } from "./middleware/logger.ts";
import { InMemoryTasksRepository, type TasksRepository } from "./tasks/tasks.repository.ts";
import { createTasksRouter } from "./tasks/tasks.routes.ts";
import { TasksService } from "./tasks/tasks.service.ts";

export interface AppOptions {
  repository?: TasksRepository;
  now?: () => Date;
  log?: (line: string) => void;
}

export function createApp({ repository = new InMemoryTasksRepository(), now, log }: AppOptions = {}) {
  const app = express();
  // כתוב כאן: express.json, logger (אם log), GET /health, /tasks, notFound, errorHandler
  return app;
}
