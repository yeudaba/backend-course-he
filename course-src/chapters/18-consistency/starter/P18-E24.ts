// P18-E24 — אתגר: checkout עם נעילות, מחיר ברגע ההזמנה ו־idempotency (הפירוט בדף התרגילים)
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  productId?: number;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

interface Item { productId: number; quantity: number }

// → { orderId, total, replayed } | EMPTY_CART | PRODUCT_NOT_FOUND | OUT_OF_STOCK (עם productId)
export async function checkout(pool: Pool, { customerId, items, idempotencyKey }: { customerId: number; items: Item[]; idempotencyKey: string }) {
  // כתוב כאן
}
