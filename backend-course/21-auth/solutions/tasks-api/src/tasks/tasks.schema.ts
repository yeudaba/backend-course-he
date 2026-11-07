import { z } from "zod";

export const STATUSES = ["todo", "in_progress", "done"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;
export const SORTS = ["createdAt", "-createdAt", "dueDate", "-dueDate", "priority", "-priority"] as const;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "חובה").max(120, "עד 120 תווים"),
  description: z.string().trim().max(2000, "עד 2000 תווים").nullable().default(null),
  status: z.enum(STATUSES).default("todo"),
  priority: z.enum(PRIORITIES).default("medium"),
  dueDate: z.iso.date("תאריך בפורמט YYYY-MM-DD").nullable().default(null),
});

export const updateTaskSchema = z
  .strictObject({
    title: z.string().trim().min(1, "חובה").max(120, "עד 120 תווים"),
    description: z.string().trim().max(2000, "עד 2000 תווים").nullable(),
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    dueDate: z.iso.date("תאריך בפורמט YYYY-MM-DD").nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, "צריך לפחות שדה אחד לעדכון");

export const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  q: z.string().trim().min(1).optional(),
  sort: z.enum(SORTS).default("-createdAt"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });

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
