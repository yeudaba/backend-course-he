// P22-E55: builders לנתוני בדיקה
export type User = { id: number; email: string; role: "user" | "admin"; createdAt: string };
export type Task = {
  id: number;
  ownerId: number;
  title: string;
  status: "todo" | "in_progress" | "done";
  dueDate: string | null;
  createdAt: string;
};

const CREATED = "2026-11-04T10:00:00.000Z";
let userSeq = 0;
let taskSeq = 0;

export function aUser(overrides: Partial<User> = {}): User {
  const seq = ++userSeq;
  const id = overrides.id ?? seq;
  return { id, email: `user${id}@example.com`, role: "user", createdAt: CREATED, ...overrides };
}

export function aTask(overrides: Partial<Task> = {}): Task {
  const seq = ++taskSeq;
  const id = overrides.id ?? seq;
  return { id, ownerId: 1, title: `משימה ${id}`, status: "todo", dueDate: null, createdAt: CREATED, ...overrides };
}

export function resetBuilders(): void {
  userSeq = 0;
  taskSeq = 0;
}
