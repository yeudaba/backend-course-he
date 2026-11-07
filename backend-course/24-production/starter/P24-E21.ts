// P24-E21: שלוש תקלות של זמן. המשתמש בישראל (Asia/Jerusalem). מצא ותקן
export function today(now: Date, tz: string): string {
  return now.toISOString().slice(0, 10);
}

// תזכורת: "אותה שעה, מחר"
export function tomorrowSameTime(instant: Date, tz: string): Date {
  return new Date(instant.getTime() + 24 * 60 * 60 * 1000);
}

// משימה באיחור אם תאריך היעד שלה כבר עבר
export function isOverdue(dueDate: string, now: Date, tz: string): boolean {
  return new Date(dueDate) < now;
}
