// P21-E06
import bcrypt from "bcryptjs";

export async function hashPassword(password: string, rounds = 12): Promise<string> {
  if (password.length === 0) throw new Error("סיסמה ריקה");
  return bcrypt.hash(password, rounds);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// hash ישן עם cost נמוך מהנוכחי? בכניסה הבאה (כשיש לנו את הסיסמה) — מחשבים מחדש
export function needsRehash(hash: string, rounds = 12): boolean {
  return bcrypt.getRounds(hash) < rounds;
}
