// P27-E37: חיתוך של שתי רשימות
export function intersection<T>(a: T[], b: T[]): T[] {
  const inB = new Set(b);
  const out: T[] = [];
  for (const x of a) {
    if (inB.delete(x)) out.push(x); // delete מחזיר true אם היה — ומונע כפילות
  }
  return out;
}
