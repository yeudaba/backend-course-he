// P18-E78: הכנסת אלפי שורות — בכמה פקודות?
import type { Pool } from "pg";

export async function insertTransfers(pool: Pool, rows: { from: number; to: number; amount: number }[]): Promise<number[]> {
  if (rows.length === 0) return [];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ids: number[] = [];
    for (let i = 0; i < rows.length; i += 1000) {
      const chunk = rows.slice(i, i + 1000);
      const values = chunk.map((_, j) => `($${j * 3 + 1}, $${j * 3 + 2}, $${j * 3 + 3})`).join(", ");
      const params = chunk.flatMap((r) => [r.from, r.to, r.amount]);
      const { rows: inserted } = await client.query(`INSERT INTO transfers (from_id, to_id, amount) VALUES ${values} RETURNING id`, params);
      ids.push(...inserted.map((r) => r.id));
    }
    await client.query("COMMIT");
    return ids;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
