// P25.7-E27: parseSort — את הקובץ הזה לא משנים. כותבים לו בדיקות ב־P25.7-E27.spec.ts
//
// ממיר ?sort=-price,name לאובייקט המיון של Mongo: { price: -1, name: 1, _id: 1 }
//   - מינוס לפני שדה ← יורד (-1); בלי ← עולה (1). רווחים סביב כל שדה לא משנים.
//   - רק שדות מתוך allowed. שדה אחר, או שדה שמופיע פעמיים ← RangeError.
//   - בסוף תמיד _id: 1 (אם לא נבחר כבר), כדי שהסדר יהיה יציב בין עמודים. הסדר של המפתחות חשוב: Mongo ממיין לפיו.
//   - אין value, או value ריק ← { _id: 1 }.

export function parseSort(value: string | undefined, allowed: string[]): Record<string, 1 | -1> {
  if (value === undefined || value.trim() === "") return { _id: 1 };
  const sort: Record<string, 1 | -1> = {};
  for (const raw of value.split(",")) {
    const part = raw.trim();
    const desc = part.startsWith("-");
    const field = desc ? part.slice(1) : part;
    if (!allowed.includes(field)) throw new RangeError(`אי אפשר למיין לפי "${field}"`);
    if (field in sort) throw new RangeError(`"${field}" מופיע פעמיים`);
    sort[field] = desc ? -1 : 1;
  }
  if (!("_id" in sort)) sort._id = 1;
  return sort;
}
