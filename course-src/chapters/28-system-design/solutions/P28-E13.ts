// P28-E13
// consistent hashing: השרתים והמפתחות על אותו "מעגל" של מספרים; מפתח שייך לשרת הראשון אחריו (עם עטיפה).
// הוספה/הסרה של שרת מזיזה רק את המפתחות שלידו — כ־1/n, לא כמעט הכול כמו ב־hash % n
import { createHash } from "node:crypto";

export function hash32(s: string): number {
  return createHash("md5").update(s).digest().readUInt32BE(0);
}

export function createRing({ vnodes = 100 }: { vnodes?: number } = {}) {
  let points: { at: number; node: string }[] = []; // ממוין לפי at
  const nodes = new Set<string>();

  return {
    add(node: string) {
      if (nodes.has(node)) return;
      nodes.add(node);
      for (let i = 0; i < vnodes; i++) points.push({ at: hash32(`${node}#${i}`), node });
      points.sort((a, b) => a.at - b.at || (a.node < b.node ? -1 : 1));
    },
    remove(node: string) {
      if (!nodes.delete(node)) return;
      points = points.filter((p) => p.node !== node);
    },
    get(key: string): string | null {
      if (points.length === 0) return null;
      const h = hash32(key);
      // חיפוש בינארי: הנקודה הראשונה שה־at שלה >= h; אין כזו — עוטפים להתחלה
      let lo = 0;
      let hi = points.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (points[mid].at < h) lo = mid + 1;
        else hi = mid;
      }
      return points[lo === points.length ? 0 : lo].node;
    },
    nodes: () => [...nodes],
  };
}
