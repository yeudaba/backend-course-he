// P18-E19
import type { Pool, PoolClient } from "pg";

const RETRYABLE = new Set(["40001", "40P01"]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withSerializableRetry<T>(pool: Pool, work: (client: PoolClient) => Promise<T>, { retries = 5 } = {}): Promise<T> {
  const client = await pool.connect();
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK");
        const code = (err as { code?: string }).code;
        if (!code || !RETRYABLE.has(code) || attempt >= retries) throw err;
        await sleep(5 + Math.random() * 20);
      }
    }
  } finally {
    client.release();
  }
}
