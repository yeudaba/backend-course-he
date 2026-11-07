// P18-E19
// withSerializableRetry(pool, work, { retries }) — SERIALIZABLE, ניסיון חוזר על 40001 / 40P01
import type { Pool, PoolClient } from "pg";

export async function withSerializableRetry<T>(pool: Pool, work: (client: PoolClient) => Promise<T>, { retries = 5 } = {}): Promise<T> {
  // כתוב כאן
}
