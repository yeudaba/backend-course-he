// P22-E62: withRollback — כל מה שהבדיקה כתבה נעלם בסוף
import type pg from "pg";

export async function withRollback<T>(pool: pg.Pool, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    return await fn(client);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
}
