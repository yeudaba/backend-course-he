// P25.5-E62: מושב — עכשיו או אף פעם (NOWAIT)
import type { Pool, RowDataPacket } from "mysql2/promise";

const ER_LOCK_NOWAIT = 3572;

export async function reserveSeat(pool: Pool, seatId: number, customerId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<RowDataPacket[]>("SELECT reserved_by FROM seats WHERE id = ? FOR UPDATE NOWAIT", [seatId]);
    let result: "reserved" | "taken" | "not_found";
    if (rows.length === 0) result = "not_found";
    else if (rows[0].reserved_by !== null) result = "taken";
    else {
      await conn.query("UPDATE seats SET reserved_by = ? WHERE id = ?", [customerId, seatId]);
      result = "reserved";
    }
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    if ((err as { errno?: number }).errno === ER_LOCK_NOWAIT) return "busy" as const;
    throw err;
  } finally {
    conn.release();
  }
}
