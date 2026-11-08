// P19.5-E24
import type { Pool } from "mysql2/promise";

export class EmptyCart extends Error {}
export class OutOfStock extends Error {
  productId: number;
  constructor(productId: number) {
    super(`אין מספיק מלאי למוצר ${productId}`);
    this.productId = productId;
  }
}

// "הזמן" של חנות הקפה — ב־MySQL. טרנזקציה אחת: מפתח idempotency, עגלה, נעילת המוצרים (FOR UPDATE, לפי id —
// סדר קבוע מונע deadlocks), בדיקת מלאי, הזמנה ופריטים עם המחיר של עכשיו, הורדת מלאי, ריקון העגלה
export async function createOrderFromCart(pool: Pool, customerId: number, idemKey: string): Promise<{ orderId: number; totalCents: number; replayed: boolean }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // אותו מפתח בבקשה מקבילה: ה־INSERT מחכה לנעילה על המפתח, וממשיך כשהראשונה מסתיימת
    const [ins] = await conn.execute<any>("INSERT IGNORE INTO order_requests (idem_key, customer_id) VALUES (?, ?)", [idemKey, customerId]);
    if (ins.affectedRows === 0) {
      // FOR SHARE — קריאה "נועלת" רואה את הגרסה המחויבת האחרונה (לא את ה־snapshot של REPEATABLE READ)
      const [[prev]] = await conn.execute<any[]>("SELECT r.customer_id, r.order_id, o.total FROM order_requests r LEFT JOIN orders o ON o.id = r.order_id WHERE r.idem_key = ? FOR SHARE", [idemKey]);
      await conn.commit();
      if (!prev || prev.customer_id !== customerId || prev.order_id === null) throw new Error("Idempotency-Key בשימוש");
      return { orderId: prev.order_id, totalCents: Math.round(Number(prev.total) * 100), replayed: true };
    }
    const [cart] = await conn.execute<any[]>("SELECT product_id, quantity FROM cart_items WHERE customer_id = ? ORDER BY product_id", [customerId]);
    if (cart.length === 0) throw new EmptyCart("העגלה ריקה");
    const [products] = await conn.query<any[]>("SELECT id, price, stock FROM products WHERE id IN (?) ORDER BY id FOR UPDATE", [cart.map((c) => c.product_id)]);
    const byId = new Map(products.map((p) => [p.id, p]));
    let totalCents = 0;
    for (const c of cart) {
      const p = byId.get(c.product_id);
      if (!p || p.stock < c.quantity) throw new OutOfStock(c.product_id);
      totalCents += Math.round(Number(p.price) * 100) * c.quantity;
    }
    const [order] = await conn.execute<any>("INSERT INTO orders (customer_id, status, total) VALUES (?, 'pending_payment', ?)", [customerId, (totalCents / 100).toFixed(2)]);
    const orderId: number = order.insertId;
    await conn.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?", [cart.map((c) => [orderId, c.product_id, c.quantity, byId.get(c.product_id).price])]);
    for (const c of cart) await conn.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [c.quantity, c.product_id]);
    await conn.execute("DELETE FROM cart_items WHERE customer_id = ?", [customerId]);
    await conn.execute("UPDATE order_requests SET order_id = ? WHERE idem_key = ?", [orderId, idemKey]);
    await conn.commit();
    return { orderId, totalCents, replayed: false };
  } catch (err) {
    await conn.rollback(); // גם שורת ה־idempotency מתבטלת — אפשר לנסות שוב עם אותו מפתח
    throw err;
  } finally {
    conn.release();
  }
}
