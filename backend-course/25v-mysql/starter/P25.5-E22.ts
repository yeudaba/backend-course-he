// P25.5-E22: "שני workers מעבדים את אותה עבודה, ולפעמים worker אחד לוקח את כל התור" — שלוש תקלות
import type { Pool } from "mysql2/promise";

export async function claimJobs(pool: Pool, workerId: string, limit: number): Promise<number[]> {
  const [rows] = await pool.query<any[]>("SELECT id FROM jobs WHERE status = 'queued' ORDER BY id");
  const ids = rows.map((r) => r.id as number);
  if (ids.length) await pool.query("UPDATE jobs SET status = 'running', locked_by = ? WHERE id IN (?)", [workerId, ids]);
  return ids;
}
