// P25.7-E28 — מה מסתתר ב־ObjectId
const OBJECT_ID = /^[0-9a-f]{24}$/i;

export function objectIdDate(id: string): Date {
  if (!OBJECT_ID.test(id)) throw new TypeError(`ObjectId לא תקין: ${id}`);
  const seconds = parseInt(id.slice(0, 8), 16);
  return new Date(seconds * 1000);
}

export function objectIdFromDate(date: Date): string {
  const seconds = Math.floor(date.getTime() / 1000);
  return seconds.toString(16).padStart(8, "0") + "0".repeat(16);
}

export function idRangeForDay(day: string): { $gte: string; $lt: string } {
  const match = day.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new TypeError(`תאריך לא תקין: ${day}`);
  const start = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { $gte: objectIdFromDate(start), $lt: objectIdFromDate(end) };
}

console.log(objectIdDate("6af2d6084b1c2d3e4f5a6b7c").toISOString());
console.log(objectIdFromDate(new Date("2026-11-10T08:30:00Z")));
console.log(idRangeForDay("2026-11-10"));
try {
  objectIdDate("6af2d608");
} catch (err) {
  console.log((err as Error).name, (err as Error).message);
}
