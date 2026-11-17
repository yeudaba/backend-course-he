// P25.5-E79: הזמנה עם הפריטים — בשאילתה אחת
import type { Pool, RowDataPacket } from "mysql2/promise";

const cents = (v: unknown) => Math.round(Number(v) * 100);

export async function orderWithItems(pool: Pool, orderId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT o.id, o.status, o.total,
            DATE_FORMAT(o.created_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS created_at,
            JSON_ARRAYAGG(JSON_OBJECT('productId', oi.product_id, 'name', p.name, 'quantity', oi.quantity, 'unitPrice', oi.unit_price)) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
      WHERE o.id = ?
      GROUP BY o.id`,
    [orderId],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  const items = (r.items as { productId: number; name: string; quantity: number; unitPrice: number | string }[])
    .map((i) => ({ productId: Number(i.productId), name: i.name, quantity: Number(i.quantity), unitPriceCents: cents(i.unitPrice) }))
    .sort((a, b) => a.productId - b.productId);
  return {
    id: Number(r.id),
    status: String(r.status),
    totalCents: cents(r.total),
    createdAt: String(r.created_at).replace(/(\.\d{3})\d{3}Z$/, "$1Z"),
    items,
  };
}
