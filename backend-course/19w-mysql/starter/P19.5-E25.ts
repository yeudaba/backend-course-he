// P19.5-E25: copyCustomers — העברת טבלה מ־PostgreSQL ל־MySQL
import type pg from "pg";
import type { Pool } from "mysql2/promise";

export async function copyCustomers(source: pg.Client | pg.Pool, target: Pool, options: { batchSize?: number } = {}): Promise<{ copied: number; batches: number }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
