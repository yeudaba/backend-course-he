// P25.5-E78: הרבה לקוחות ב־INSERT אחד
import type { Pool, ResultSetHeader } from "mysql2/promise";

export async function createCustomers(pool: Pool, list: { name: string; email: string; city: string }[]) {
  if (list.length === 0) return [];
  const [res] = await pool.query<ResultSetHeader>(
    "INSERT INTO customers (name, email, city) VALUES ?",
    [list.map((c) => [c.name, c.email, c.city])],
  );
  return list.map((c, i) => ({ id: res.insertId + i, email: c.email }));
}
