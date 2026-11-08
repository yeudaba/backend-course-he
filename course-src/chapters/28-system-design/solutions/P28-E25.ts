// P28-E25
// Bloom filter: "בטוח לא קיים" או "אולי קיים" — במעט זיכרון. אין false negatives; false positives בשיעור שבוחרים.
// m ביטים ו־k פונקציות hash, מחושבים מגודל צפוי n ושיעור טעות p
import { createHash } from "node:crypto";

export function createBloom(expected: number, falsePositiveRate: number) {
  const m = Math.ceil((-expected * Math.log(falsePositiveRate)) / Math.LN2 ** 2);
  const k = Math.max(1, Math.round((m / expected) * Math.LN2));
  const bits = new Uint8Array(Math.ceil(m / 8));

  // double hashing: שני hashים מ־sha256, ומהם k מיקומים (h1 + i·h2)
  const positions = (item: string) => {
    const d = createHash("sha256").update(item).digest();
    const h1 = d.readUInt32BE(0);
    const h2 = (d.readUInt32BE(4) | 1) >>> 0; // ">>> 0": בלי זה, | הופך מספר גדול לשלילי — ומיקום שלילי ב־Uint8Array פשוט לא נכתב
    return Array.from({ length: k }, (_, i) => (h1 + i * h2) % m);
  };

  return {
    m,
    k,
    bytes: bits.length,
    add(item: string) {
      for (const p of positions(item)) bits[p >> 3] |= 1 << (p & 7);
    },
    mightContain(item: string): boolean {
      return positions(item).every((p) => (bits[p >> 3] & (1 << (p & 7))) !== 0);
    },
  };
}
