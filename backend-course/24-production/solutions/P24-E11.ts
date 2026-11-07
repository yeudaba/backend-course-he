// P24-E11
export function isValidTimeZone(tz: string): boolean {
  if (typeof tz !== "string" || tz === "") return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz }); // אזור לא קיים ← RangeError
    return true;
  } catch {
    return false;
  }
}

// en-CA כותב תאריכים כ־YYYY-MM-DD; hourCycle h23 — 00–23 (בלי "24:00" בחצות)
export function localDate(instant: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}

export function localTime(instant: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(instant);
}

// "2026-11-04" עבר? רק אם הוא לפני "היום" באזור של המשתמש. מחרוזות YYYY-MM-DD משוות נכון כמחרוזות
export function isPastInZone(date: string, now: Date, tz: string): boolean {
  return date < localDate(now, tz);
}
