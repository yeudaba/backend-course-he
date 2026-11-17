// P16-E48: לנחש טיפוס לכל עמודה
type Row = Record<string, unknown>;
export type Column = { column: string; type: string; nullable: boolean };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function typeOf(values: unknown[]): string {
  if (values.length === 0) return "unknown";
  if (values.every((v) => Number.isInteger(v))) return "integer";
  if (values.every((v) => typeof v === "number")) return "numeric";
  if (values.every((v) => typeof v === "boolean")) return "boolean";
  if (values.every((v) => typeof v === "string" && DATE.test(v))) return "date";
  if (values.every((v) => typeof v === "string")) return "text";
  return "mixed";
}

export function describe(rows: Row[]): Column[] {
  const columns = new Set<string>();
  for (const row of rows) for (const key of Object.keys(row)) columns.add(key);
  return [...columns].map((column) => {
    const values = rows.map((r) => r[column]);
    const present = values.filter((v) => v !== null && v !== undefined);
    return { column, type: typeOf(present), nullable: present.length < rows.length };
  });
}

console.table(
  describe([
    { id: 1, name: "Pen", price: 4.5, active: true, added_on: "2026-01-10", note: null },
    { id: 2, name: "Cup", price: 19, active: false, added_on: "2026-02-01", note: null, color: "red" },
    { id: 3, name: 42, price: 7, active: true, added_on: "soon", note: null },
  ]),
);
