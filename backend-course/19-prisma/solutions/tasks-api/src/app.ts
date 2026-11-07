import cors from "cors";
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
  corsOrigins?: string[];
}

export function createApp({
  repository = new InMemoryTasksRepository(),
  now,
  log,
  corsOrigins = ["http://localhost:5500"],
}: AppOptions = {}) {
  const app = express();
  // רק הדף שלנו (ולא כל אתר באינטרנט) רשאי לקרוא ל־API מהדפדפן — יחידה 15.5
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());
  if (log) app.use(logger(log));

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });
  app.use("/tasks", createTasksRouter(new TasksService(repository, now)));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
