// P24-E52: גיל לפי תאריך לידה
function parse(s: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new RangeError(`תאריך לא תקין: ${s}`);
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const check = new Date(Date.UTC(y, mo - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) throw new RangeError(`תאריך לא קיים: ${s}`);
  return [y, mo, d];
}

export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = parse(birthDate);
  const [ty, tm, td] = parse(today);
  if (birthDate > today) throw new RangeError("תאריך הלידה אחרי היום");
  const beforeBirthday = tm < bm || (tm === bm && td < bd); // 28.2 < 29.2, ו־1.3 כבר אחרי
  return ty - by - (beforeBirthday ? 1 : 0);
}

export function ageAt(birthDate: string, instant: Date, tz: string): number {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
  return ageOn(birthDate, today);
}

console.log(ageOn("1990-05-17", "2026-05-16"), ageOn("1990-05-17", "2026-05-17"));
console.log(ageOn("2004-02-29", "2026-02-28"), ageOn("2004-02-29", "2026-03-01"));
console.log(ageAt("2000-11-05", new Date("2026-11-04T22:30:00Z"), "Asia/Jerusalem"), ageAt("2000-11-05", new Date("2026-11-04T22:30:00Z"), "UTC"));
