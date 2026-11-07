// P18-E21: נמכרו יותר יחידות ממה שהיה במלאי
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function buy(pool: Pool, productId: number, qty: number): Promise<number> {
  const { rows } = await pool.query("SELECT stock FROM inventory WHERE product_id = $1", [productId]);
  if (rows.length === 0) throw new AppError("PRODUCT_NOT_FOUND");
  if (rows[0].stock < qty) throw new AppError("OUT_OF_STOCK");
  const remaining = rows[0].stock - qty;
  await pool.query("UPDATE inventory SET stock = $1 WHERE product_id = $2", [remaining, productId]);
  return remaining;
}
