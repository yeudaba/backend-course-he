// P24-E25: מתי התזכורת הבאה? "כל יום ב־09:00" — לפי השעון של המשתמש
export interface Schedule {
  hour: number;
  minute: number;
  days?: number[]; // 0 = ראשון … 6 = שבת. בלי — כל יום
}

export function nextRun(schedule: Schedule, after: Date, tz: string): Date {
  return after; // כתוב כאן
}

export function upcoming(schedule: Schedule, after: Date, tz: string, count: number): Date[] {
  return []; // כתוב כאן
}
