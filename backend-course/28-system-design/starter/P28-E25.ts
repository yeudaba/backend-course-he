// P28-E25: Bloom filter
import { createHash } from "node:crypto";

export function createBloom(expected: number, falsePositiveRate: number): { m: number; k: number; bytes: number; add(item: string): void; mightContain(item: string): boolean } {
  throw new Error("עוד לא כתבת את הפתרון");
}
