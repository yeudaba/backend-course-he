// P25.5-E75: לקוח חדש — insertId ואימייל תפוס
import type { Pool, ResultSetHeader } from "mysql2/promise";

export async function createCustomer(pool: Pool, input: { name: string; email: string; city: string }) {
  const row = { name: input.name.trim(), email: input.email.trim().toLowerCase(), city: input.city.trim() };
  try {
    const [res] = await pool.execute<ResultSetHeader>("INSERT INTO customers (name, email, city) VALUES (?, ?, ?)", [row.name, row.email, row.city]);
    return { id: res.insertId, ...row };
  } catch (err) {
    if ((err as { errno?: number }).errno === 1062) throw new Error("EMAIL_TAKEN");
    throw err;
  }
}
