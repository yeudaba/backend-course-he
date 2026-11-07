// שלב 1. הסכמות והטיפוסים של משימה (הפירוט בדף "שלב 1")
import { z } from "zod";

export const STATUSES = ["todo", "in_progress", "done"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;
export const SORTS = ["createdAt", "-createdAt", "dueDate", "-dueDate", "priority", "-priority"] as const;

export const createTaskSchema = z.object({
  // כתוב כאן
});

export const updateTaskSchema = z.object({
  // כתוב כאן
});

export const listQuerySchema = z.object({
  // כתוב כאן
});

export const idParamsSchema = z.object({
  // כתוב כאן
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
