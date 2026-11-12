// P18-E53: מימוש קופון — פעם אחת לכל משתמש
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function redeem(pool: Pool, code: string, userId: number): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("UPDATE coupons SET uses_left = uses_left - 1 WHERE code = $1 AND uses_left > 0 RETURNING uses_left", [code]);
    if (rows.length === 0) {
      const exists = await client.query("SELECT 1 FROM coupons WHERE code = $1", [code]);
      throw new AppError(exists.rowCount === 0 ? "COUPON_NOT_FOUND" : "COUPON_EXHAUSTED");
    }
    await client.query("INSERT INTO coupon_redemptions (code, user_id) VALUES ($1, $2)", [code, userId]);
    await client.query("COMMIT");
    return rows[0].uses_left;
  } catch (err: any) {
    await client.query("ROLLBACK");
    if (err.code === "23505") throw new AppError("ALREADY_REDEEMED");
    throw err;
  } finally {
    client.release();
  }
}
