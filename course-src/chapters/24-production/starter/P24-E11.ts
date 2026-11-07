// P24-E11: תאריך ושעה "מקומיים" — לפי אזור זמן, לא לפי השרת
export function isValidTimeZone(tz: string): boolean {
  return false; // כתוב כאן
}

export function localDate(instant: Date, tz: string): string {
  return instant.toISOString().slice(0, 10); // לא נכון! זה התאריך ב־UTC
}

export function localTime(instant: Date, tz: string): string {
  return ""; // כתוב כאן
}

export function isPastInZone(date: string, now: Date, tz: string): boolean {
  return false; // כתוב כאן
}
