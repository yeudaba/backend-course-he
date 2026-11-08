// P28-E20: "קודים יוצאים הפוכים, 0 נותן קוד ריק, והלולאה לא נגמרת" — שלוש תקלות
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encode(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error("רק מספר שלם אי־שלילי");
  let out = "";
  let guard = 0;
  while (n > 0 && guard++ < 50) {
    out += ALPHABET[Math.floor(n % 62)];
    n = n / 62;
  }
  return out;
}

export function decode(code: string): number {
  if (!/^[0-9a-zA-Z]+$/.test(code)) throw new Error("קוד לא תקין");
  let n = 0;
  for (const ch of code) n = n * 62 + ALPHABET.indexOf(ch);
  return n;
}
