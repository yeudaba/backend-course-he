// P18-E82: שינוי שם בעל החשבון
import type { Pool } from "pg";

export async function renameOwner(pool: Pool, id: number, owner: string): Promise<boolean> {
  const name = owner.trim();
  if (!name) throw new Error("שם ריק");
  const { rowCount } = await pool.query(`UPDATE accounts SET owner = '${name}' WHERE id = ${id}`);
  return rowCount === 1;
}
