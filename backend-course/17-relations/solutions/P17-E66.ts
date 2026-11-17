// P17-E66: הכנסה לפי קטגוריה בטווח תאריכים
export type Db = { query(text: string, values?: unknown[]): Promise<{ rows: any[] }> };
export type CategoryRevenue = { category: string; units: number; revenue: number };

export async function categoryRevenue(client: Db, { from, to, minRevenue = 0 }: { from: string; to: string; minRevenue?: number }): Promise<CategoryRevenue[]> {
  if (from >= to) throw new Error("טווח תאריכים לא תקין");
  const { rows } = await client.query(
    `SELECT cat.name AS category, SUM(oi.quantity) AS units, SUM(oi.quantity * oi.unit_price) AS revenue
     FROM order_items oi
     JOIN orders o       ON o.id = oi.order_id
     JOIN products p     ON p.id = oi.product_id
     JOIN categories cat ON cat.id = p.category_id
     WHERE o.status <> 'cancelled' AND o.created_at >= $1 AND o.created_at < $2
     GROUP BY cat.name
     HAVING SUM(oi.quantity * oi.unit_price) >= $3
     ORDER BY revenue DESC, category`,
    [from, to, minRevenue],
  );
  return rows.map((r) => ({ category: r.category, units: Number(r.units), revenue: Number(r.revenue) }));
}
