// P16-E71: צבירות ב־JavaScript שמתנהגות כמו SQL
type Row = Record<string, unknown>;
type Value = number | string;

export function aggregate(rows: Row[], column: string) {
  const values = rows.map((r) => r[column]).filter((v) => v !== null && v !== undefined) as Value[];
  if (values.length === 0) return { count: 0, countAll: rows.length, sum: null, avg: null, min: null, max: null };
  let min = values[0];
  let max = values[0];
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const numbers = values as number[];
  const sum = typeof values[0] === "number" ? numbers.reduce((s, x) => s + x, 0) : null;
  return { count: values.length, countAll: rows.length, sum, avg: sum === null ? null : sum / values.length, min, max };
}

console.log(aggregate([{ x: 10 }, { x: null }, { x: 20 }, {}], "x"));
console.log(aggregate([{ d: "2026-03-05" }, { d: "2025-11-02" }, { d: null }], "d"));
console.log(aggregate([], "x"));
