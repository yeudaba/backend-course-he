// P28-E22
import { createHash } from "node:crypto";

const hash32 = (s: string) => createHash("md5").update(s).digest().readUInt32BE(0);

export function createRing({ vnodes = 50 } = {}) {
  let points: { at: number; node: string }[] = [];
  return {
    add(node: string) {
      for (let i = 0; i < vnodes; i++) points.push({ at: hash32(`${node}#${i}`), node });
      points.sort((a, b) => a.at - b.at); // תקלה 1: לא מיינו אחרי הוספה ← החיפוש הבינארי על מערך לא ממוין
    },
    remove(node: string) {
      points = points.filter((p) => p.node !== node); // תקלה 2: הסירו רק את הנקודה הראשונה של השרת ← "שרת רפאים" ממשיך לקבל מפתחות
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
      return points[lo % points.length].node; // תקלה 3: היה points[lo] ← מפתח אחרי הנקודה האחרונה מקבל undefined במקום לעטוף להתחלה
    },
  };
}
