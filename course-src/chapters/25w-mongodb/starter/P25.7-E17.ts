// P25.7-E17: הזמנה בטרנזקציה
import type { Db, MongoClient } from "mongodb";

export class OutOfStockError extends Error {}

export async function placeOrder(client: MongoClient, db: Db, customerId: string, cart: { productId: string; qty: number }[]) {
  // כתוב כאן
}
