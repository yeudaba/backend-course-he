// P25.5-E98: שורה מ־PostgreSQL לשורה של MySQL
export function toMysqlValue(v: unknown): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v instanceof Date) return v.toISOString().replace("T", " ").replace("Z", "");
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "object") return JSON.stringify(v);
  return v as string | number;
}

export function pgRowToMysql(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, toMysqlValue(v)]));
}
