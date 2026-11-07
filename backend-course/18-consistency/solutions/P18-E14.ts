// P18-E14
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function bookSeat(pool: Pool, eventId: number, userId: number): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const event = await client.query("SELECT capacity FROM events WHERE id = $1 FOR UPDATE", [eventId]);
    if (event.rowCount === 0) throw new AppError("EVENT_NOT_FOUND");
    const { rows } = await client.query("SELECT COUNT(*)::int AS taken FROM bookings WHERE event_id = $1", [eventId]);
    const capacity = event.rows[0].capacity;
    try {
      await client.query("INSERT INTO bookings (event_id, user_id) VALUES ($1, $2)", [eventId, userId]);
    } catch (err) {
      if ((err as { code?: string }).code === "23505") throw new AppError("ALREADY_BOOKED");
      throw err;
    }
    if (rows[0].taken >= capacity) throw new AppError("SOLD_OUT");
    await client.query("COMMIT");
    return capacity - rows[0].taken - 1;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
