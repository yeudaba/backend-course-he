// טבעת consistent hashing לדוגמה — לבדיקה של E16 (כדי שהיא לא תלויה בפתרון שלך ל־E13)
import { createHash } from "node:crypto";
const hash32 = (s) => createHash("md5").update(s).digest().readUInt32BE(0);
export function referenceRing(vnodes = 100) {
  const points = [];
  return {
    add(node) {
      for (let i = 0; i < vnodes; i++) points.push({ at: hash32(`${node}#${i}`), node });
      points.sort((a, b) => a.at - b.at);
    },
    get(key) {
      const h = hash32(key);
      const i = points.findIndex((p) => p.at >= h);
      return points[i === -1 ? 0 : i].node;
    },
  };
}
