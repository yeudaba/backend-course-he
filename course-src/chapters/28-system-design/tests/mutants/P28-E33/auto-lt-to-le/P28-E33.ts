// P28-E33: מיליון ביום — כמה בשנייה?
const DAY = 86_400;

function check(n: number) {
  if (!Number.isFinite(n) || n <= 0) throw new RangeError(`מספר לא תקין: ${n}`);
}

export function perSecond(perDay: number): number {
  check(perDay);
  return Math.round((perDay / DAY) * 10) / 10;
}

export function perDayFrom(perSecond: number): number {
  check(perSecond);
  return Math.round(perSecond * DAY);
}
