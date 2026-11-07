// P22-E10 — הקוד שבודקים (לא משנים אותו)
export type DueStatus = "none" | "overdue" | "today" | "soon" | "later";

// מצב תאריך היעד, לפי "היום" ב־UTC. soon = עד 3 ימים (כולל)
export function dueStatus(dueDate: string | null, now: Date): DueStatus {
  if (dueDate === null) return "none";
  const today = now.toISOString().slice(0, 10);
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  const days = (Date.parse(dueDate) - Date.parse(today)) / 86_400_000;
  return days <= 3 ? "soon" : "later";
}
