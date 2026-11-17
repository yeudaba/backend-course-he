// P16-E41: אילוצים ב־JavaScript
type Row = Record<string, unknown>;
export type Rules = { notNull?: string[]; unique?: string[]; check?: Record<string, (row: Row) => boolean> };

export function checkRows(rows: Row[], rules: Rules): string[] {
  const problems: string[] = [];
  const seen = new Map<string, Set<unknown>>();
  rows.forEach((row, i) => {
    for (const col of rules.notNull ?? []) {
      if (row[col] === null || row[col] === undefined) problems.push(`row ${i}: ${col} is null`);
    }
    for (const col of rules.unique ?? []) {
      const value = row[col];
      if (value === null || value === undefined) continue;
      if (!seen.has(col)) seen.set(col, new Set());
      if (seen.get(col)!.has(value)) problems.push(`row ${i}: duplicate ${col}: ${value}`);
      seen.get(col)!.add(value);
    }
    for (const [name, fn] of Object.entries(rules.check ?? {})) {
      if (!fn(row)) problems.push(`row ${i}: check ${name} failed`);
    }
  });
  return problems;
}

const customers = [
  { email: "dana@example.com", price: 10 },
  { email: "dana@example.com", price: -5 },
  { email: null, price: 3 },
  { email: null, price: 0 },
];
console.log(checkRows(customers, { notNull: ["email"], unique: ["email"], check: { positive_price: (r) => (r.price as number) > 0 } }));
