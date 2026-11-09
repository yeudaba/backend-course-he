// P28.5-E18: HyperLogLog — כמה ערכים שונים, ב־4KB זיכרון
import { createHash } from "node:crypto";

export interface HLL {
  p: number;
  registers: Uint8Array;
}

export const createHLL = (p = 12): HLL => ({ p, registers: new Uint8Array(1 << p) });

// מוכן: hash של 32 ביט, מפוזר היטב
export const hash32 = (value: string | number): number => createHash("sha1").update(String(value)).digest().readUInt32BE(0);

export function add(h: HLL, value: string | number): void {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function count(h: HLL): number {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function mergeHLL(a: HLL, b: HLL): HLL {
  throw new Error("עוד לא כתבת את הפתרון");
}
