// P18-E07
// transfer(pool, fromId, toId, amount) → id של ההעברה | שגיאה → ROLLBACK וזריקה | release תמיד
import type { Pool } from "pg";

export async function transfer(pool: Pool, fromId: number, toId: number, amount: number): Promise<number> {
  // כתוב כאן
}
