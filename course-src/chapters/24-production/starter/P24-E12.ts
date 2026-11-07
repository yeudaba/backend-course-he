// P24-E12: מתאריך ושעה מקומיים ← רגע ב־UTC (כולל מעברי שעון קיץ)
export function offsetMinutes(instant: Date, tz: string): number {
  return 0; // כתוב כאן
}

export function zonedTimeToUtc(date: string, time: string, tz: string): Date {
  return new Date(`${date}T${time}:00Z`); // לא נכון! זה מתייחס לשעה כאילו היא ב־UTC
}

export function startOfDayInZone(date: string, tz: string): Date {
  return zonedTimeToUtc(date, "00:00", tz);
}

export function dayRangeInZone(date: string, tz: string): { start: Date; end: Date } {
  const start = startOfDayInZone(date, tz);
  return { start, end: new Date(start.getTime() + 24 * 3600_000) }; // לא נכון בימי מעבר שעון
}
