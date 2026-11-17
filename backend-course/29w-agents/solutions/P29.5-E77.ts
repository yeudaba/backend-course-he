// P29.5-E77: רק השדות שצריך
export function pickFields(rows: Record<string, unknown>[], fields: string[], opts: { maxRows: number }): string {
  if (!Number.isInteger(opts.maxRows) || opts.maxRows <= 0) throw new RangeError("maxRows חייב להיות שלם חיובי");
  const shown = rows.slice(0, opts.maxRows).map((r) => Object.fromEntries(fields.filter((f) => Object.hasOwn(r, f)).map((f) => [f, r[f]])));
  const omitted = rows.length - shown.length;
  const out: Record<string, unknown> = { rows: shown, total: rows.length, omitted };
  if (omitted > 0) out.note = `showing ${shown.length} of ${rows.length} rows; ask for fewer fields or use offset`;
  return JSON.stringify(out);
}
