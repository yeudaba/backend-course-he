// P28.5-E91: נתיבים של partitions
export function partitionPath(table: string, at: string | Date, part: number): string {
  if (!/^[a-z_]+$/.test(table)) throw new Error(`שם טבלה לא תקין: ${table}`);
  if (!Number.isInteger(part) || part <= 0 || part > 99_999) throw new Error(`part לא תקין: ${part}`);
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) throw new Error(`תאריך לא תקין: ${String(at)}`);
  return `lake/${table}/day=${d.toISOString().slice(0, 10)}/part-${String(part).padStart(5, "0")}.parquet`;
}

export function parsePartition(p: string) {
  const m = p.match(/^lake\/([a-z_]+)\/day=(\d{4}-\d{2}-\d{2})\/part-(\d{5})\.parquet$/);
  if (!m) throw new Error(`נתיב לא מוכר: ${p}`);
  return { table: m[1], day: m[2], part: Number(m[3]) };
}
