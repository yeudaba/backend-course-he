// P18-E48: שמירת מלאי עם כלל "מלאי נמוך"
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function reserve(pool: Pool, productId: number, qty: number): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT stock FROM inventory WHERE product_id = $1 FOR UPDATE", [productId]);
    if (rows.length === 0) throw new AppError("PRODUCT_NOT_FOUND");
    const stock: number = rows[0].stock;
    if (stock < 5 && qty > 2) throw new AppError("LOW_STOCK_LIMIT");
    if (qty > stock) throw new AppError("OUT_OF_STOCK");
    const updated = await client.query("UPDATE inventory SET stock = stock - $2 WHERE product_id = $1 RETURNING stock", [productId, qty]);
    await client.query("COMMIT");
    return updated.rows[0].stock;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
