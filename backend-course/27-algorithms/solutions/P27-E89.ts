// P27-E89: סיסמאות עם scrypt ו־salt
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [kind, saltHex, hashHex] = stored.split("$");
  if (kind !== "scrypt" || !/^[0-9a-f]{32}$/.test(saltHex ?? "") || !/^[0-9a-f]{128}$/.test(hashHex ?? "")) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
