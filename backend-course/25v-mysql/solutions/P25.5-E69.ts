// P25.5-E69: מחיקת לקוח — בלי לשבור הזמנות
import type { Pool, ResultSetHeader } from "mysql2/promise";

export async function anonymizeCustomer(pool: Pool, customerId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [cart] = await conn.query<ResultSetHeader>("DELETE FROM cart_items WHERE customer_id = ?", [customerId]);
    const [upd] = await conn.query<ResultSetHeader>(
      "UPDATE customers SET name = 'Deleted user', email = CONCAT('deleted+', id, '@invalid.local'), city = '' WHERE id = ?",
      [customerId],
    );
    if (upd.affectedRows === 0) throw new Error("NOT_FOUND");
    await conn.commit();
    return { cartItemsRemoved: cart.affectedRows };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
