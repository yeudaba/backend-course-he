// P16-E46: מ־CSV לשורות עם טיפוסים
export type ColumnType = "text" | "integer" | "numeric" | "boolean" | "date";

function convert(raw: string, type: ColumnType, column: string, n: number): unknown {
  const v = raw.trim();
  if (v === "") return null;
  const fail = () => {
    throw new Error(`line ${n}: invalid ${type} for ${column}: "${v}"`);
  };
  switch (type) {
    case "text":
      return v;
    case "integer":
      return /^-?\d+$/.test(v) ? Number(v) : fail();
    case "numeric":
      return Number.isFinite(Number(v)) ? Number(v) : fail();
    case "boolean":
      return v === "true" ? true : v === "false" ? false : fail();
    case "date":
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : fail();
  }
}

export function parseCsv(text: string, types: Record<string, ColumnType>): Record<string, unknown>[] {
  const lines = text.split(/\r?\n/).map((line, i) => ({ line, n: i + 1 }));
  const [header, ...rest] = lines.filter((l) => l.line.trim() !== "");
  if (!header) return [];
  const columns = header.line.split(",").map((c) => c.trim());
  return rest.map(({ line, n }) => {
    const values = line.split(",");
    if (values.length !== columns.length) throw new Error(`line ${n}: expected ${columns.length} values, got ${values.length}`);
    return Object.fromEntries(columns.map((c, i) => [c, convert(values[i], types[c] ?? "text", c, n)]));
  });
}

const csv = "name,price,stock,is_active,added_on\nHand Grinder,189.00,8,true,2026-02-14\n\nMoka Pot , 149, ,false,\n";
console.log(parseCsv(csv, { price: "numeric", stock: "integer", is_active: "boolean", added_on: "date" }));
try {
  parseCsv("name,stock\nPen,3\nCup,2.5\n", { stock: "integer" });
} catch (err) {
  console.log((err as Error).message);
}
