// P19.5-E19: migrate — כלי migrations קטן, עם GET_LOCK
import type { Pool } from "mysql2/promise";

export async function migrate(pool: Pool, migrations: readonly { id: string; sql: string }[], options: { lockTimeoutSeconds?: number } = {}): Promise<string[]> {
  throw new Error("עוד לא כתבת את הפתרון");
}
