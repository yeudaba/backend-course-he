// P25.7-E11: ההזמנות של לקוח
import type { Db } from "mongodb";

export async function customerOrders(db: Db, customerId: string, { status }: { status?: string[] } = {}) {
  return []; // כתוב כאן
}
