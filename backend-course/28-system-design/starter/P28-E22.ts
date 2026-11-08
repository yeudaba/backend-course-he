// P28-E22: "חלק מהמפתחות מקבלים undefined, שרת שהוסר ממשיך לקבל בקשות, ומפתחות קופצים בין שרתים" — שלוש תקלות
import { createHash } from "node:crypto";

const hash32 = (s: string) => createHash("md5").update(s).digest().readUInt32BE(0);

export function createRing({ vnodes = 50 } = {}) {
  let points: { at: number; node: string }[] = [];
  return {
    add(node: string) {
      for (let i = 0; i < vnodes; i++) points.push({ at: hash32(`${node}#${i}`), node });
    },
    remove(node: string) {
      points.splice(points.findIndex((p) => p.node === node), 1);
    },
    get(key: string): string | null {
      if (points.length === 0) return null;
      const h = hash32(key);
      let lo = 0;
      let hi = points.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (points[mid].at < h) lo = mid + 1;
        else hi = mid;
      }
      return points[lo]?.node;
    },
  };
}
