// P24-E21
const MIN = 60_000;
const DAY = 86_400_000;

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

// תקלה 1: toISOString הוא התאריך ב־UTC. בישראל בין 00:00 ל־02:00/03:00 — זה "אתמול"
export function today(now: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

// תקלה 2: יום ≠ 24 שעות. ביום המעבר לשעון קיץ +24 שעות נותן 10:00 במקום 09:00
export function tomorrowSameTime(instant: Date, tz: string): Date {
  const p = parts(instant, tz);
  const wall = Date.UTC(p.y, p.m - 1, p.d + 1, p.h, p.mi);
  const before = offset(wall - DAY, tz);
  const after = offset(wall + DAY, tz);
  const ok = [before, after].map((o) => wall - o * MIN).filter((t) => offset(t, tz) * MIN + t === wall).sort((a, b) => a - b);
  return new Date(ok.length ? ok[0] : wall - before * MIN);
}

// תקלה 3: new Date("2026-11-05") הוא חצות UTC — המשימה "באיחור" כבר ביום עצמו (ובישראל — מ־02:00 בלילה).
// תאריך יעד הוא יום בלוח השנה: באיחור רק כשהוא לפני "היום" של המשתמש
export function isOverdue(dueDate: string, now: Date, tz: string): boolean {
  return dueDate < today(now, tz);
}
