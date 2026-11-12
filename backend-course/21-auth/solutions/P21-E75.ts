// P21-E75: מדיניות הרשאות במקום אחד
export type User = { id: number; role: "user" | "admin" };
export type Task = { id: number; ownerId: number; archived: boolean };
export type Action = "read" | "update" | "delete" | "list-all";
export type Decision = "OK" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND";

export function decide(user: User | null, action: Action, task?: Task): Decision {
  if (!user) return "UNAUTHORIZED";
  if (action === "list-all") return user.role === "admin" ? "OK" : "FORBIDDEN";
  if (!task || (task.ownerId !== user.id && user.role !== "admin")) return "NOT_FOUND";
  if (action === "update" && task.archived) return "FORBIDDEN";
  return "OK";
}

const STATUS = { OK: 200, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404 } as const;

export function statusOf(d: Decision): 200 | 401 | 403 | 404 {
  return STATUS[d];
}
