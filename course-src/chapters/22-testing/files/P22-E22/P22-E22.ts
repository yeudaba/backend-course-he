// P22-E22 — הקוד שבודקים (לא משנים אותו). כל החישובים ב־UTC
export function daysLeftInMonth(now: Date = new Date()): number {
  const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  return lastDay - now.getUTCDate();
}

export function isWeekend(now: Date = new Date()): boolean {
  const day = now.getUTCDay();
  return day === 5 || day === 6; // שישי ושבת
}
