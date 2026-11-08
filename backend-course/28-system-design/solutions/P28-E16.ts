// P28-E16
// כמה מפתחות זזים כשמוסיפים שרת? hash % n מזיז כמעט הכול; consistent hashing — כ־1/n
import { createHash } from "node:crypto";

export const hash32 = (s: string) => createHash("md5").update(s).digest().readUInt32BE(0);
export const moduloShard = (key: string, n: number) => hash32(key) % n;

export function movedFraction(keys: readonly string[], before: (k: string) => string | number, after: (k: string) => string | number): number {
  if (keys.length === 0) return 0;
  let moved = 0;
  for (const k of keys) if (before(k) !== after(k)) moved++;
  return moved / keys.length;
}

// makeRing — טבעת consistent hashing (כמו E13): { add(node), get(key) }
export function compareResharding(
  keys: readonly string[],
  from: number,
  to: number,
  makeRing: () => { add(node: string): void; get(key: string): string | null },
) {
  const before = makeRing();
  const after = makeRing();
  for (let i = 0; i < from; i++) before.add(`db${i}`);
  for (let i = 0; i < to; i++) after.add(`db${i}`);
  return {
    modulo: movedFraction(keys, (k) => moduloShard(k, from), (k) => moduloShard(k, to)),
    ring: movedFraction(keys, (k) => before.get(k)!, (k) => after.get(k)!),
  };
}
