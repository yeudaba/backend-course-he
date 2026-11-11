// P17-E56: פרטי הזמנה מהמסד, בשאילתה אחת
export type Db = { query(text: string, values?: unknown[]): Promise<{ rows: any[] }> };
export type OrderDetails = { id: number; status: string; customer: { id: number; name: string };
  items: { product: string; quantity: number; unitPrice: number }[] };

export async function getOrderDetails(client: Db, orderId: number): Promise<OrderDetails | null> {
  const { rows } = await client.query(
    `SELECT o.id AS order_id, o.status, c.id AS customer_id, c.full_name,
            p.name AS product, oi.quantity, oi.unit_price
     FROM orders o
     JOIN customers c        ON c.id = o.customer_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p     ON p.id = oi.product_id
     WHERE o.id = $1
     ORDER BY p.name`,
    [orderId],
  );
  if (rows.length === 0) return null;
  const first = rows[0];
  return {
    id: first.order_id,
    status: first.status,
    customer: { id: first.customer_id, name: first.full_name },
    items: rows
      .filter((r) => r.product !== null)
      .map((r) => ({ product: r.product, quantity: r.quantity, unitPrice: Number(r.unit_price) })),
  };
}
