// P25.5-E27 — INSERT מרובה שורות, עם upsert
type Value = string | number | boolean | null;

const IDENT = /^[a-z_][a-z0-9_]*$/;

function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`שם לא חוקי: ${name}`);
  return `\`${name}\``;
}

export function buildBulkInsert(
  table: string,
  rows: Record<string, Value>[],
  options: { add?: string[]; set?: string[] } = {},
): { sql: string; params: Value[] } {
  if (rows.length === 0) throw new Error("אין שורות");
  const columns = Object.keys(rows[0]);
  const key = [...columns].sort().join(",");
  for (const row of rows) {
    if (Object.keys(row).sort().join(",") !== key) throw new Error("לכל השורות צריכות להיות אותן עמודות");
  }

  const placeholders = `(${columns.map(() => "?").join(", ")})`;
  let sql = `INSERT INTO ${ident(table)} (${columns.map(ident).join(", ")}) VALUES ${rows.map(() => placeholders).join(", ")}`;
  const params = rows.flatMap((row) => columns.map((c) => row[c]));

  const updates = [
    ...(options.add ?? []).map((c) => `${ident(c)} = ${ident(table)}.${ident(c)} + new.${ident(c)}`),
    ...(options.set ?? []).map((c) => `${ident(c)} = new.${ident(c)}`),
  ];
  if (updates.length > 0) sql += ` AS new ON DUPLICATE KEY UPDATE ${updates.join(", ")}`;
  return { sql, params };
}

console.log(buildBulkInsert("cart_items", [
  { customer_id: 1, product_id: 3, quantity: 2 },
  { product_id: 4, customer_id: 1, quantity: 1 },
], { add: ["quantity"] }));
try {
  buildBulkInsert("products; DROP TABLE orders", [{ id: 1 }]);
} catch (err) {
  console.log((err as Error).message);
}
