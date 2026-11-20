// P28.5-E57: pbkdf2 בלי לחסום, עם הגבלה
import { pbkdf2 } from "node:crypto";

const derive = (password: string, salt: string) =>
  new Promise<string>((resolve, reject) => {
    pbkdf2(password, salt, 100_000, 32, "sha256", (err, key) => (err ? reject(err) : resolve(key.toString("hex"))));
  });

export async function deriveAll(passwords: string[], salt: string, limit = 2): Promise<string[]> {
  const out: string[] = new Array(passwords.length);
  let next = 0;
  async function worker() {
    while (next <= passwords.length) {
      const i = next++;
      out[i] = await derive(passwords[i], salt);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, passwords.length) }, worker));
  return out;
}
