// P25-E67: expand ו־contract — במסד אמיתי
import type { Pool } from "pg";

export async function expand(pool: Pool): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS name text");
    const r = await client.query("UPDATE tasks SET name = title WHERE name IS NULL");
    await client.query("COMMIT");
    return r.rowCount ?? 0;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function contract(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM tasks WHERE name IS NULL");
    if (rows[0].n > 0) throw new Error("NOT_MIGRATED");
    await client.query("ALTER TABLE tasks DROP COLUMN title");
    await client.query("ALTER TABLE tasks ALTER COLUMN name SET NOT NULL");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
