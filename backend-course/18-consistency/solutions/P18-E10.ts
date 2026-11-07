// P18-E10
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function buy(pool: Pool, productId: number, qty: number): Promise<number> {
  const { rows } = await pool.query(
    "UPDATE inventory SET stock = stock - $2 WHERE product_id = $1 AND stock >= $2 RETURNING stock",
    [productId, qty]
  );
  if (rows.length > 0) return rows[0].stock;
  const exists = await pool.query("SELECT 1 FROM inventory WHERE product_id = $1", [productId]);
  throw new AppError(exists.rowCount === 0 ? "PRODUCT_NOT_FOUND" : "OUT_OF_STOCK");
}
