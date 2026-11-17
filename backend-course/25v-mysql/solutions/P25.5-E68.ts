// P25.5-E68: POST /orders עם mysql2 — בלי למכור יותר מדי
import { Router } from "express";
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

const fail = (code: string) => ({ error: { code } });
const isPositiveInt = (v: unknown) => Number.isInteger(v) && (v as number) > 0;

export function ordersRouter(pool: Pool) {
  const router = Router();
  router.post("/orders", async (req, res, next) => {
    const { customerId, productId, quantity } = req.body ?? {};
    if (![customerId, productId, quantity].every(isPositiveInt)) {
      res.status(400).json(fail("VALIDATION_ERROR"));
      return;
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [upd] = await conn.query<ResultSetHeader>(
        "UPDATE products SET stock = stock - ? WHERE id = ? AND is_active AND stock >= ?",
        [quantity, productId, quantity],
      );
      if (upd.affectedRows === 0) {
        const [found] = await conn.query<RowDataPacket[]>("SELECT id FROM products WHERE id = ? AND is_active", [productId]);
        await conn.rollback();
        res.status(found.length ? 409 : 404).json(fail(found.length ? "OUT_OF_STOCK" : "PRODUCT_NOT_FOUND"));
        return;
      }
      const [[p]] = await conn.query<RowDataPacket[]>("SELECT price FROM products WHERE id = ?", [productId]);
      const [order] = await conn.query<ResultSetHeader>(
        "INSERT INTO orders (customer_id, status, total) VALUES (?, 'pending_payment', ? * ?)",
        [customerId, p.price, quantity],
      );
      await conn.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)", [order.insertId, productId, quantity, p.price]);
      await conn.commit();
      res.status(201).json({ orderId: order.insertId, totalCents: Math.round(Number(p.price) * 100) * quantity });
    } catch (err) {
      await conn.rollback();
      if ((err as { errno?: number }).errno === 1452) {
        res.status(404).json(fail("CUSTOMER_NOT_FOUND"));
        return;
      }
      next(err);
    } finally {
      conn.release();
    }
  });
  return router;
}
