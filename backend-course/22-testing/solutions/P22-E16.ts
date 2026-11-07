// P22-E16 — builders: ערכי ברירת מחדל תקינים, ids ייחודיים, ורק מה שחשוב לבדיקה — כותבים במפורש
export interface User {
  id: number;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Task {
  id: number;
  ownerId: number;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
}

let nextUserId = 1;
let nextTaskId = 1;

export function aUser(overrides: Partial<User> = {}): User {
  const id = overrides.id ?? nextUserId++;
  return { id, email: `user${id}@example.com`, role: "user", createdAt: "2026-11-01T00:00:00.000Z", ...overrides };
}

export function aTask(overrides: Partial<Task> = {}): Task {
  const id = overrides.id ?? nextTaskId++;
  return { id, ownerId: 1, title: `משימה ${id}`, status: "todo", priority: "medium", dueDate: null, ...overrides };
}

export function resetBuilders(): void {
  nextUserId = 1;
  nextTaskId = 1;
}
