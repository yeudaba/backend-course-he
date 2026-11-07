// P18-E20: שלוש בעיות — הכסף "נוצר" בכישלון, והשרת נתקע אחרי כמה כישלונות
import type { Pool } from "pg";

export async function transfer(pool: Pool, fromId: number, toId: number, amount: number) {
  const client = await pool.connect();
  await pool.query("BEGIN");
  await pool.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
  await pool.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
  await pool.query("COMMIT");
  client.release();
}
