// P21-E06: hashPassword, verifyPassword, needsRehash — עם bcryptjs
import bcrypt from "bcryptjs";

export async function hashPassword(password: string, rounds = 12): Promise<string> {
  return password; // כתוב כאן
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return false; // כתוב כאן
}

export function needsRehash(hash: string, rounds = 12): boolean {
  return false; // כתוב כאן
}
