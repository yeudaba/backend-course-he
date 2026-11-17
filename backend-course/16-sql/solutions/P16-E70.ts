// P16-E70: דוח מלאי מ־Node
export type Db = { query(text: string, values?: unknown[]): Promise<{ rows: any[] }> };
export type Report = { products: number; units: number; cheapest: number | null; priciest: number | null; avgPrice: number | null };

const num = (v: string | number | null) => (v === null ? null : Number(v));

export async function inventoryReport(client: Db, category?: string): Promise<Report> {
  const values: unknown[] = [];
  let where = "is_active";
  if (category !== undefined) {
    values.push(category);
    where += " AND category = $1";
  }
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS products, COALESCE(SUM(stock), 0)::int AS units,
            MIN(price) AS cheapest, MAX(price) AS priciest, ROUND(AVG(price), 2) AS avg_price
     FROM products WHERE ${where}`,
    values,
  );
  const r = rows[0];
  return { products: r.products, units: r.units, cheapest: num(r.cheapest), priciest: num(r.priciest), avgPrice: num(r.avg_price) };
}
