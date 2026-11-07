// P24-E25
const MIN = 60_000;
const DAY = 86_400_000;

export interface Schedule {
  hour: number;
  minute: number;
  days?: number[]; // 0 = ראשון … 6 = שבת. בלי — כל יום
}

function parts(instant: Date, tz: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
      .formatToParts(instant)
      .map((x) => [x.type, Number(x.value)]),
  );
  return { y: p.year, m: p.month, d: p.day, h: p.hour, mi: p.minute };
}
const offset = (t: number, tz: string) => {
  const p = parts(new Date(t), tz);
  return (Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi) - Math.floor(t / MIN) * MIN) / MIN;
};
function wallToUtc(wall: number, tz: string): number {
  const before = offset(wall - DAY, tz);
  const after = offset(wall + DAY, tz);
  const ok = [before, after].map((o) => wall - o * MIN).filter((t) => offset(t, tz) * MIN + t === wall).sort((a, b) => a - b);
  return ok.length ? ok[0] : wall - before * MIN;
}

function validate({ hour, minute, days }: Schedule) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new RangeError("hour: 0–23");
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new RangeError("minute: 0–59");
  if (days && (days.length === 0 || days.some((d) => !Number.isInteger(d) || d < 0 || d > 6))) throw new RangeError("days: 0–6, לפחות יום אחד");
}

// הריצה הבאה — אחרי after (לא כולל). עוברים על ימים בלוח השנה *המקומי*, לא על 24 שעות
export function nextRun(schedule: Schedule, after: Date, tz: string): Date {
  validate(schedule);
  const start = parts(after, tz);
  for (let i = 0; i <= 7; i++) {
    const wall = Date.UTC(start.y, start.m - 1, start.d + i, schedule.hour, schedule.minute);
    const weekday = new Date(Date.UTC(start.y, start.m - 1, start.d + i)).getUTCDay();
    if (schedule.days && !schedule.days.includes(weekday)) continue;
    // שעה שלא קיימת (שעון קיץ) ← קדימה; שעה כפולה (חורף) ← רק המופע הראשון, פעם אחת
    const t = wallToUtc(wall, tz);
    if (t > after.getTime()) return new Date(t);
  }
  throw new Error("לא אמור לקרות"); // תוך 8 ימים תמיד יש התאמה
}

export function upcoming(schedule: Schedule, after: Date, tz: string, count: number): Date[] {
  const out: Date[] = [];
  let cursor = after;
  while (out.length < count) {
    cursor = nextRun(schedule, cursor, tz);
    out.push(cursor);
  }
  return out;
}
