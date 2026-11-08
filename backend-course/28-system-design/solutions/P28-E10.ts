// P28-E10
// קוד קצר אקראי: אין צורך במונה משותף בין שרתים. התנגשות — נדירה, אבל קורית: בודקים ומנסים שוב
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export async function generateCode(
  exists: (code: string) => Promise<boolean>,
  { length = 7, maxAttempts = 5, random = Math.random }: { length?: number; maxAttempts?: number; random?: () => number } = {},
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";
    for (let i = 0; i < length; i++) code += ALPHABET[Math.floor(random() * 62)];
    if (!(await exists(code))) return code;
  }
  throw new Error(`לא נמצא קוד פנוי אחרי ${maxAttempts} ניסיונות`);
}
