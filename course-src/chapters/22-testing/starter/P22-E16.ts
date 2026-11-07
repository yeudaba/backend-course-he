// P22-E16: builders לנתוני בדיקה — aUser, aTask, resetBuilders (המפרט בדף התרגילים)
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

export function aUser(overrides: Partial<User> = {}): User {
  throw new Error("כתוב כאן");
}

export function aTask(overrides: Partial<Task> = {}): Task {
  throw new Error("כתוב כאן");
}

export function resetBuilders(): void {}
