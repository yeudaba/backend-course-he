// P24-E98: "היום" של המשתמש ב־TasksService
export type UsersRepo = { findById(id: number): Promise<{ id: number; timeZone: string } | null> };

const localDate = (at: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);

export function createTodayFor(users: UsersRepo, now: () => Date) {
  return async (userId: number) => {
    const user = await users.findById(userId);
    return localDate(now(), user?.timeZone ?? "UTC");
  };
}

export function countOverdue(tasks: { status: string; dueDate: string | null }[], today: string): number {
  return tasks.filter((t) => t.status !== "done" && t.dueDate !== null && t.dueDate < today).length;
}
