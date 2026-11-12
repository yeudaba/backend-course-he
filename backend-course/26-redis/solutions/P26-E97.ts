// P26-E97: ביטול הזמנה שפגה — בתנאי, בטרנזקציה
import type pg from "pg";

export async function expireOrder(pool: pg.Pool, orderId: number): Promise<"expired" | "skipped"> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const r = await client.query("UPDATE orders SET status = 'cancelled' WHERE id = $1 AND status = 'pending_payment'", [orderId]);
    if (r.rowCount === 0) {
      await client.query("ROLLBACK");
      return "skipped";
    }
    await client.query(
      "UPDATE products p SET stock = p.stock + i.quantity FROM order_items i WHERE i.order_id = $1 AND i.product_id = p.id",
      [orderId],
    );
    await client.query("COMMIT");
    return "expired";
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
