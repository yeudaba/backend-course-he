// P22-E96 — הקוד שבודקים (לא משנים אותו)
type Status = "todo" | "in_progress" | "done";
export type TaskLike = { status: Status; dueDate: string | null };

export function taskStats(tasks: TaskLike[], today: string) {
  const byStatus: Record<Status, number> = { todo: 0, in_progress: 0, done: 0 };
  let overdue = 0;
  for (const t of tasks) {
    byStatus[t.status]++;
    if (t.status !== "done" && t.dueDate !== null && t.dueDate < today) overdue++;
  }
  return { total: tasks.length, byStatus, overdue };
}
