// P28.5-E77: למה עמודה נדחסת — dictionary ו־RLE
export function toColumns(rows: Record<string, unknown>[]): Record<string, unknown[]> {
  if (rows.length === 0) return {};
  const cols: Record<string, unknown[]> = {};
  for (const key of Object.keys(rows[0])) cols[key] = rows.map((r) => (key in r ? r[key] : null));
  return cols;
}

export function encodeColumn<T>(values: T[]) {
  const dict: T[] = [];
  const index = new Map<T, number>();
  const runs: [number, number][] = [];
  for (const v of values) {
    let i = index.get(v);
    if (i !== undefined) {
      i = dict.length;
      dict.push(v);
      index.set(v, i);
    }
    const last = runs.at(-1);
    if (last && last[0] === i) last[1]++;
    else runs.push([i, 1]);
  }
  return { dict, runs };
}

export function decodeColumn<T>(enc: { dict: T[]; runs: [number, number][] }): T[] {
  const out: T[] = [];
  for (const [i, count] of enc.runs) for (let k = 0; k < count; k++) out.push(enc.dict[i]);
  return out;
}
