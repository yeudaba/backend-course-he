// P15-E17
// PATCH /tasks/:id — title / done / priority, לפחות אחד, בלי שדות לא מוכרים | 400 / 404 / 200
import express from "express";
import { z } from "zod";

export function createApp() {
  const app = express();
  app.use(express.json());
  const tasks = [
    { id: 1, title: "לקנות חלב", done: false, priority: "medium" },
    { id: 2, title: "לסיים את פרק 15", done: false, priority: "high" },
  ];
  // כתוב כאן
  return app;
}
