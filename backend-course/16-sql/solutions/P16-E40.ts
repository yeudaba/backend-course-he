// P16-E40: פלט כמו psql
type Row = Record<string, unknown>;

export function formatTable(rows: Row[]): string {
  const footer = `(${rows.length} ${rows.length === 1 ? "row" : "rows"})`;
  if (rows.length === 0) return footer;
  const cols = Object.keys(rows[0]);
  const text = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => text(r[c]).length)));
  const line = (cells: string[]) =>
    cells
      .map((c, i) => ` ${c.padEnd(widths[i])} `)
      .join("|")
      .trimEnd();
  return [line(cols), widths.map((w) => "-".repeat(w + 2)).join("+"), ...rows.map((r) => line(cols.map((c) => text(r[c])))), footer].join("\n");
}

console.log(formatTable([{ name: "Hand Grinder", price: "189.00" }, { name: "Electric Grinder Pro", price: "649.00" }]));
console.log(formatTable([{ full_name: "Yossi Cohen", phone: null }]));
console.log(formatTable([]));
