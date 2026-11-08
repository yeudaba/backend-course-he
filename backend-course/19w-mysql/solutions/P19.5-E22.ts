// P19.5-E22
import type { Pool } from "mysql2/promise";

export async function claimJobs(pool: Pool, workerId: string, limit: number): Promise<number[]> {
  const conn = await pool.getConnection(); // תקלה 1: היה pool.query ישירות ← כל פקודה בחיבור אחר, בלי טרנזקציה — הנעילה משתחררת מיד אחרי ה־SELECT
  try {
    await conn.beginTransaction();
    // תקלה 2: בלי FOR UPDATE SKIP LOCKED ← שני workers קוראים אותן שורות ושניהם "לוקחים"
    // תקלה 3: לא היה LIMIT ← worker אחד "לקח" את כל התור, והשאר עמדו בטלים
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
