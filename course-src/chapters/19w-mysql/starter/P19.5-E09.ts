// P19.5-E09: insertOrder — הזמנה בטרנזקציה, עם mysql2
import type { Pool } from "mysql2/promise";

export class OutOfStock extends Error {}

export async function insertOrder(pool: Pool, order: { customerId: number; items: { productId: number; quantity: number }[] }): Promise<{ orderId: number; totalCents: number }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
