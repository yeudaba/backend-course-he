// P11-E38: ימים בין תאריכים
const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(from: Date, to: Date): number {
  return Math.trunc((to.getTime() - from.getTime()) / DAY_MS);
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 5 || day === 6;
}

console.log(daysBetween(new Date("2026-01-01"), new Date("2026-01-31")));
console.log(daysBetween(new Date("2026-01-31"), new Date("2026-01-01T12:00:00Z")));
console.log(isWeekend(new Date(2026, 10, 13)), isWeekend(new Date(2026, 10, 15)));
