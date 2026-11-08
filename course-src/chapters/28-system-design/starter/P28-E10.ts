// P28-E10: קוד קצר אקראי עם ניסיון חוזר על התנגשות
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export async function generateCode(
  exists: (code: string) => Promise<boolean>,
  options: { length?: number; maxAttempts?: number; random?: () => number } = {},
): Promise<string> {
  throw new Error("עוד לא כתבת את הפתרון");
}
