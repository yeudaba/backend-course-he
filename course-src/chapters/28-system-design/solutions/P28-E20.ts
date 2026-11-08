// P28-E20
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encode(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error("רק מספר שלם אי־שלילי");
  if (n === 0) return "0"; // תקלה 1: בלי זה, 0 ← "" (הלולאה לא רצה), וקוד ריק לא מתפענח
  let out = "";
  while (n > 0) {
    out = ALPHABET[n % 62] + out; // תקלה 2: היה out += … ← הספרות יוצאות הפוך (הקטנה ראשונה)
    n = Math.floor(n / 62); // תקלה 3: היה n / 62 ← שבר, והלולאה ממשיכה עם 0.0something עד שמתקבל אפס
  }
  return out;
}

export function decode(code: string): number {
  if (!/^[0-9a-zA-Z]+$/.test(code)) throw new Error("קוד לא תקין");
  let n = 0;
  for (const ch of code) n = n * 62 + ALPHABET.indexOf(ch);
  return n;
}
