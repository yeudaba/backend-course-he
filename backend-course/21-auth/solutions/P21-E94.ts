// P21-E94: seed אידמפוטנטי
import bcrypt from "bcryptjs";

type Db = { query(text: string, params?: unknown[]): Promise<any> };
export type DemoUser = { email: string; password: string; role: "user" | "admin" };

export async function seedUsers(db: Db, users: DemoUser[], rounds: number): Promise<number> {
  const hashes = await Promise.all(users.map((u) => bcrypt.hash(u.password, rounds)));
  let added = 0;
  for (const [i, u] of users.entries()) {
    const { rowCount } = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
      [u.email.toLowerCase(), hashes[i], u.role],
    );
    added += rowCount;
  }
  return added;
}
