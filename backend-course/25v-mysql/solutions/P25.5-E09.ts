// P25.5-E09
import type { Pool } from "mysql2/promise";

export class OutOfStock extends Error {}

// הזמנה בטרנזקציה ב־mysql2: חיבור אחד מה־pool לכל הטרנזקציה (getConnection), ו־release בכל מקרה.
// execute = prepared statement עם ? — אף פעם לא שרשור מחרוזות. ואין RETURNING: את ה־id נותן insertId
export async function insertOrder(pool: Pool, order: { customerId: number; items: { productId: number; quantity: number }[] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const ids = order.items.map((i) => i.productId).sort((a, b) => a - b); // נועלים תמיד באותו סדר — פחות deadlocks
    const [rows] = await conn.query<any[]>("SELECT id, price, stock FROM products WHERE id IN (?) ORDER BY id FOR UPDATE", [ids]);
    const byId = new Map(rows.map((r) => [r.id, r]));
    let totalCents = 0;
    for (const item of order.items) {
      const p = byId.get(item.productId);
      if (!p || p.stock < item.quantity) throw new OutOfStock(`אין מספיק מלאי למוצר ${item.productId}`);
      totalCents += Math.round(Number(p.price) * 100) * item.quantity;
    }
    const [res] = await conn.execute<any>("INSERT INTO orders (customer_id, status, total) VALUES (?, 'pending_payment', ?)", [order.customerId, (totalCents / 100).toFixed(2)]);
    const orderId: number = res.insertId;
    await conn.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?", [
      order.items.map((i) => [orderId, i.productId, i.quantity, byId.get(i.productId).price]),
    ]);
    for (const item of order.items) {
      await conn.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.productId]);
    }
    await conn.commit();
    return { orderId, totalCents };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
