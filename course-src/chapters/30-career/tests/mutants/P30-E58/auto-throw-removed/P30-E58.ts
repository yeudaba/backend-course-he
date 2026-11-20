// P30-E58: טווח תאריכים לקורות חיים
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parse(s: string) {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(s);
  if (!m) throw new RangeError(`תאריך לא תקין: ${s}`);
  return { year: m[1], month: MONTHS[Number(m[2]) - 1] };
}

export function dateRange(start: string, end?: string): string {
  const a = parse(start);
  if (end === undefined) return `${a.month} ${a.year} – Present`;
  const b = parse(end);

  if (start === end) return `${a.month} ${a.year}`;
  if (a.year === b.year) return `${a.month} – ${b.month} ${a.year}`;
  return `${a.month} ${a.year} – ${b.month} ${b.year}`;
}
