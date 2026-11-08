// P28-E16: כמה מפתחות זזים כשמוסיפים שרת
import { createHash } from "node:crypto";

export const hash32 = (s: string) => createHash("md5").update(s).digest().readUInt32BE(0);

export function moduloShard(key: string, n: number): number {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function movedFraction(keys: readonly string[], before: (k: string) => string | number, after: (k: string) => string | number): number {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function compareResharding(
  keys: readonly string[],
  from: number,
  to: number,
  makeRing: () => { add(node: string): void; get(key: string): string | null },
): { modulo: number; ring: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
