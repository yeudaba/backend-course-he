// P28.5-E82: pivot לדשבורד
export function pivot(rows: Record<string, string | number>[], rowKey: string, colKey: string, valueKey: string) {
  const columns = [...new Set(rows.map((r) => String(r[colKey])))].sort();
  const cells = new Map<string | number, Map<string, number>>();
  for (const r of rows) {
    const rk = r[rowKey];
    if (!cells.has(rk)) cells.set(rk, new Map());
    const row = cells.get(rk)!;
    const ck = String(r[colKey]);
    row.set(ck, (row.get(ck) ?? 0) + Number(r[valueKey]));
  }
  const out = [...cells].map(([rk, row]) => [rk, ...columns.map((c) => (row.has(c) ? row.get(c)! : null))]);
  return { columns, rows: out };
}
