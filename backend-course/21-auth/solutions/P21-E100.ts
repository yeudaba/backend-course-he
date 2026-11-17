// P21-E100: החלפת סיסמה וביטול refresh tokens — הכול או כלום
import bcrypt from "bcryptjs";

type Client = { query(text: string, params?: unknown[]): Promise<any>; release(): void };
type Pool = { connect(): Promise<Client> };

export async function changePassword(
  pool: Pool,
  userId: number,
  oldPassword: string,
  newPassword: string,
  rounds: number,
  now: Date,
): Promise<"OK" | "NOT_FOUND" | "WRONG_PASSWORD"> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT password_hash FROM users WHERE id = $1 FOR UPDATE", [userId]);
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return "NOT_FOUND";
    }
    if (!(await bcrypt.compare(oldPassword, rows[0].password_hash))) {
      await client.query("ROLLBACK");
      return "WRONG_PASSWORD";
    }
    const hash = await bcrypt.hash(newPassword, rounds);
    await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, userId]);
    await client.query("UPDATE refresh_tokens SET revoked_at = $1 WHERE user_id = $2 AND revoked_at IS NULL", [now, userId]);
    await client.query("COMMIT");
    return "OK";
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
