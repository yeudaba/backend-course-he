// P19.5-E17: once — idempotency ב־MySQL
import type { Pool } from "mysql2/promise";

export class InProgress extends Error {}

export async function once<T>(pool: Pool, key: string, fn: () => Promise<T>): Promise<{ result: T; replayed: boolean }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
