// P19.5-E24: createOrderFromCart — "הזמן" של חנות הקפה, ב־MySQL
import type { Pool } from "mysql2/promise";

export class EmptyCart extends Error {}
export class OutOfStock extends Error {
  productId: number;
  constructor(productId: number) {
    super(`אין מספיק מלאי למוצר ${productId}`);
    this.productId = productId;
  }
}

export async function createOrderFromCart(pool: Pool, customerId: number, idemKey: string): Promise<{ orderId: number; totalCents: number; replayed: boolean }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
