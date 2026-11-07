// P24-E13
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

// מ־E12: שעה על השעון באזור ← רגע (שעה שלא קיימת ← קדימה; כפולה ← הראשונה)
function wallToUtc(wall: number, tz: string): number {
  const before = offset(wall - DAY, tz);
  const after = offset(wall + DAY, tz);
  const ok = [before, after].map((o) => wall - o * MIN).filter((t) => offset(t, tz) * MIN + t === wall).sort((a, b) => a - b);
  return ok.length ? ok[0] : wall - before * MIN;
}

// "אותה שעה, בעוד N ימים" — לא N*24 שעות: ביום מעבר שעון זה לא אותו דבר
export function addLocalDays(instant: Date, days: number, tz: string): Date {
  const p = parts(instant, tz);
  return new Date(wallToUtc(Date.UTC(p.y, p.m - 1, p.d + days, p.h, p.mi), tz));
}

export function isSameLocalDay(a: Date, b: Date, tz: string): boolean {
  const x = parts(a, tz);
  const y = parts(b, tz);
  return x.y === y.y && x.m === y.m && x.d === y.d;
}

// כמה ימים (בלוח השנה של המשתמש) עד dueDate: 0 = היום, 1 = מחר, שלילי = עבר
export function daysUntil(dueDate: string, now: Date, tz: string): number {
  const [y, m, d] = dueDate.split("-").map(Number);
  const p = parts(now, tz);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(p.y, p.m - 1, p.d)) / DAY);
}
