// P18-E10
// buy(pool, productId, qty) → המלאי שנשאר | PRODUCT_NOT_FOUND | OUT_OF_STOCK — בלי מרוץ
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function buy(pool: Pool, productId: number, qty: number): Promise<number> {
  // כתוב כאן
}
