// P28-E13: consistent hashing עם virtual nodes
import { createHash } from "node:crypto";

// hash של 32 ביט (מספר בין 0 ל־2³²−1) — מוכן לשימוש
export function hash32(s: string): number {
  return createHash("md5").update(s).digest().readUInt32BE(0);
}

export function createRing(options: { vnodes?: number } = {}): { add(node: string): void; remove(node: string): void; get(key: string): string | null; nodes(): string[] } {
  throw new Error("עוד לא כתבת את הפתרון");
}
