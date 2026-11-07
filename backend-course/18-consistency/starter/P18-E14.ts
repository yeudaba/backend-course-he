// P18-E14
// bookSeat(pool, eventId, userId) → מקומות שנשארו | EVENT_NOT_FOUND | ALREADY_BOOKED | SOLD_OUT
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function bookSeat(pool: Pool, eventId: number, userId: number): Promise<number> {
  // כתוב כאן
}
