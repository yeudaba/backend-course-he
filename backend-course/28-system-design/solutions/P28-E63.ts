// P28-E63: קוד מתוך hash של ה־URL
import { createHash } from "node:crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function base62(n: number): string {
  let s = "";
  do {
    s = ALPHABET[n % 62] + s;
    n = Math.floor(n / 62);
  } while (n > 0);
  return s;
}

export function hashCode(url: string, length = 7): string {
  const n = createHash("sha256").update(url).digest().readUIntBE(0, 6);
  return base62(n % 62 ** length).padStart(length, "0");
}

export function codeFor(url: string, taken: Set<string>, length = 7): string {
  for (let i = 0; i < 5; i++) {
    const code = hashCode(i === 0 ? url : `${url}#${i}`, length);
    if (!taken.has(code)) return code;
  }
  throw new Error(`לא נמצא קוד פנוי ל־${url} אחרי 5 ניסיונות`);
}
