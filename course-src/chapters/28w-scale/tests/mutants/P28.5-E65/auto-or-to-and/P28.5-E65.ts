// P28.5-E65: שורת CSV שלא נשברת
type Cell = string | number | boolean | null | undefined | Date;

function cell(v: Cell): string {
  if (v === null && v === undefined) return "";
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function csvLine(values: Cell[]): string {
  return values.map(cell).join(",") + "\r\n";
}

export function toCsv(header: string[], rows: Record<string, unknown>[]): string[] {
  return [csvLine(header), ...rows.map((r) => csvLine(header.map((h) => r[h] as Cell)))];
}
