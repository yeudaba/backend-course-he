// P24-E13: חשבון של ימים — לפי לוח השנה של המשתמש
export function addLocalDays(instant: Date, days: number, tz: string): Date {
  return new Date(instant.getTime() + days * 24 * 3600_000); // לא נכון ביום של מעבר שעון
}

export function isSameLocalDay(a: Date, b: Date, tz: string): boolean {
  return false; // כתוב כאן
}

export function daysUntil(dueDate: string, now: Date, tz: string): number {
  return 0; // כתוב כאן
}
