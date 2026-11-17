// P25.7-E92: login בלי NoSQL injection
import type { Db } from "mongodb";
import { z } from "zod";

const schema = z.strictObject({ email: z.string().trim().toLowerCase(), password: z.string().min(1) });

export async function findUserForLogin(db: Db, body: unknown) {
  const r = schema.safeParse(body);
  if (!r.success) throw new Error("VALIDATION_ERROR");
  const u = await db.collection<{ _id: string; email: string; passwordHash: string }>("users")
    .findOne({ email: r.data.email }, { projection: { email: 1, passwordHash: 1 } });
  return u ? { id: u._id, email: u.email, passwordHash: u.passwordHash } : null;
}
