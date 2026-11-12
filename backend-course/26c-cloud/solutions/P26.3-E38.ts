// P26.3-E38: תחזית חשבון והתראות תקציב
const cents = (x: number) => Math.round(x * 100) / 100;

export function forecastMonth(dailyCosts: number[], daysInMonth: number) {
  if (dailyCosts.length === 0) return 0;
  const spent = dailyCosts.reduce((s, x) => s + x, 0);
  const avg = spent / dailyCosts.length;
  return cents(spent + avg * (daysInMonth - dailyCosts.length));
}

export function budgetAlerts(dailyCosts: number[], budget: number, thresholds = [0.5, 0.8, 1]) {
  const cumulative: number[] = [];
  let sum = 0;
  for (const c of dailyCosts) cumulative.push((sum += c));
  const out: { threshold: number; day: number }[] = [];
  for (const threshold of thresholds) {
    const i = cumulative.findIndex((x) => x >= threshold * budget - 1e-9);
    if (i !== -1) out.push({ threshold, day: i + 1 });
  }
  return out;
}
