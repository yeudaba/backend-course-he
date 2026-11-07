// P18-E08
import type { Pool } from "pg";

export async function findByOwner(pool: Pool, owner: string) {
  const { rows } = await pool.query("SELECT id, owner, balance FROM accounts WHERE owner = $1 ORDER BY id", [owner]);
  return rows;
}

export async function searchOwners(pool: Pool, text: string) {
  const escaped = text.replace(/[\\%_]/g, "\\$&"); // % ו־_ שהמשתמש הקליד — כתווים רגילים
  const { rows } = await pool.query("SELECT id, owner, balance FROM accounts WHERE owner ILIKE '%' || $1 || '%' ORDER BY id", [escaped]);
  return rows;
}
