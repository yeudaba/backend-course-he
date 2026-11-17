// P24-E51: שעון מקומי עם offset
export function toLocalIso(instant: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(instant);
  const p: Record<string, string> = {};
  for (const { type, value } of parts) p[type] = value;
  // השעון באזור "כאילו" היה UTC, פחות הרגע עצמו = ה־offset
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  const seconds = Math.floor(instant.getTime() / 1000) * 1000;
  const offset = Math.round((asUtc - seconds) / 60_000);
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${sign}${hh}:${mm}`;
}

for (const [iso, tz] of [["2026-11-04T22:30:00Z", "Asia/Jerusalem"], ["2026-07-01T09:15:42.999Z", "Asia/Jerusalem"], ["2026-01-15T12:00:00Z", "America/New_York"], ["2026-01-15T12:00:00Z", "Asia/Kolkata"]]) {
  console.log(toLocalIso(new Date(iso), tz));
}
