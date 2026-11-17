// P21-E43: מעבר הדרגתי מ־SHA-256 ל־bcrypt
import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "node:crypto";

export type StoredUser = { id: number; passwordHash: string };

export async function verifyAndUpgrade(
  user: StoredUser,
  password: string,
  save: (id: number, newHash: string) => Promise<void>,
  rounds: number,
): Promise<boolean> {
  if (user.passwordHash.startsWith("$2")) return bcrypt.compare(password, user.passwordHash);
  if (!/^[0-9a-f]{64}$/.test(user.passwordHash)) return false;
  const given = createHash("sha256").update(password).digest();
  const stored = Buffer.from(user.passwordHash, "hex");
  if (!timingSafeEqual(given, stored)) return false;
  await save(user.id, await bcrypt.hash(password, rounds));
  return true;
}
