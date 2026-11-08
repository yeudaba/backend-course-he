// P28-E06
// base62: ספרות 0-9, a-z, A-Z. כמו בסיס 10 או 16 — רק עם 62 "ספרות". 7 תווים = 62⁷ ≈ 3.5 טריליון קודים
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encode(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error("רק מספר שלם אי־שלילי");
  if (n === 0) return "0";
  let out = "";
  while (n > 0) {
    out = ALPHABET[n % 62] + out;
    n = Math.floor(n / 62);
  }
  return out;
}

export function decode(code: string): number {
  if (!/^[0-9a-zA-Z]+$/.test(code)) throw new Error("קוד לא תקין");
  let n = 0;
  for (const ch of code) n = n * 62 + ALPHABET.indexOf(ch);
  if (!Number.isSafeInteger(n)) throw new Error("קוד ארוך מדי");
  return n;
}
