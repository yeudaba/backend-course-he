// P18-E75: הזמנות עם השורות שלהן — שתי שאילתות
import type { Pool } from "pg";

export type OrderWithLines = { id: number; total: number; lines: { product: string; quantity: number; unitPrice: number }[] };

export async function ordersWithLines(pool: Pool, orderIds: number[]): Promise<OrderWithLines[]> {
  if (orderIds.length === 0) return [];
  const ids = [...new Set(orderIds)];
  const orders = await pool.query("SELECT id, total FROM shop_orders WHERE id = ANY($1)", [ids]);
  const lines = await pool.query(
    `SELECT l.order_id, c.name AS product, l.quantity, l.unit_price
     FROM shop_order_lines l JOIN catalog c ON c.id = l.product_id
     WHERE l.order_id = ANY($1)
     ORDER BY l.order_id, c.name`,
    [ids],
  );
  const byOrder = new Map<number, OrderWithLines["lines"]>();
  for (const l of lines.rows) {
    if (!byOrder.has(l.order_id)) byOrder.set(l.order_id, []);
    byOrder.get(l.order_id)!.push({ product: l.product, quantity: l.quantity, unitPrice: Number(l.unit_price) });
  }
  const found = new Map<number, number>(orders.rows.map((o) => [o.id, Number(o.total)]));
  return ids.filter((id) => found.has(id)).map((id) => ({ id, total: found.get(id)!, lines: byOrder.get(id) ?? [] }));
}
