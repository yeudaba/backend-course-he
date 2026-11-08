// P19.5-E14
import type { Pool } from "mysql2/promise";

// תור עבודות על טבלה: כמה workers לוקחים עבודות במקביל, בלי שאותה עבודה תילקח פעמיים.
// FOR UPDATE נועל את השורות שנבחרו; SKIP LOCKED (MySQL 8.0+) מדלג על נעולות במקום לחכות להן
export async function claimJobs(pool: Pool, workerId: string, limit: number): Promise<number[]> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<any[]>("SELECT id FROM jobs WHERE status = 'queued' ORDER BY id LIMIT ? FOR UPDATE SKIP LOCKED", [limit]);
    const ids = rows.map((r) => r.id as number);
    if (ids.length) await conn.query("UPDATE jobs SET status = 'running', locked_by = ? WHERE id IN (?)", [workerId, ids]);
    await conn.commit();
    return ids;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
