// P16-E57: ייצוא תוצאה ל־CSV
export type Db = { query(text: string, values?: unknown[]): Promise<{ rows: any[]; fields: { name: string }[] }> };

const cell = (v: unknown) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

export async function exportCsv(client: Db, text: string, values: unknown[] = []): Promise<string> {
  const { rows, fields } = await client.query(text, values);
  const names = fields.map((f) => f.name);
  const lines = [names.map(cell).join(","), ...rows.map((r) => names.map((n) => cell(r[n])).join(","))];
  return lines.join("\r\n") + "\r\n";
}
