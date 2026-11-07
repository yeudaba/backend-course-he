// P24-E12
const MIN = 60_000;

// ההפרש (בדקות) בין השעה המקומית ל־UTC ברגע מסוים: ישראל בחורף 120, בקיץ 180
export function offsetMinutes(instant: Date, tz: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
      .formatToParts(instant)
      .map((x) => [x.type, Number(x.value)]),
  );
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round((asIfUtc - Math.floor(instant.getTime() / MIN) * MIN) / MIN);
}

// "2026-03-27" + "09:00" בישראל ← הרגע ב־UTC
export function zonedTimeToUtc(date: string, time: string, tz: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi); // השעה על השעון, "כאילו" ב־UTC
  // שני ה־offsets האפשריים סביב אותו יום (לפני ואחרי מעבר שעון)
  const before = offsetMinutes(new Date(wall - 86_400_000), tz);
  const after = offsetMinutes(new Date(wall + 86_400_000), tz);
  const matches = [before, after]
    .map((o) => wall - o * MIN)
    .filter((t) => offsetMinutes(new Date(t), tz) * MIN + t === wall)
    .sort((a, b) => a - b);
  if (matches.length > 0) return new Date(matches[0]); // שעה כפולה (חזרה לשעון חורף) ← המופע הראשון
  return new Date(wall - before * MIN); // שעה שלא קיימת (מעבר לשעון קיץ) ← "קופצים" קדימה, כמו השעון
}

export function startOfDayInZone(date: string, tz: string): Date {
  return zonedTimeToUtc(date, "00:00", tz);
}

// טווח של יום מקומי, לשאילתה: start <= created_at < end
export function dayRangeInZone(date: string, tz: string): { start: Date; end: Date } {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  return { start: startOfDayInZone(date, tz), end: startOfDayInZone(next, tz) };
}
