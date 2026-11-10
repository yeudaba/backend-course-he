// P24-E32: parseRetryAfter — את הקובץ הזה לא משנים. כותבים לו בדיקות ב־P24-E32.spec.ts
//
// header ‏Retry-After (בתשובת 429 או 503) מגיע בשתי צורות:
//   "120"                            ← מספר שניות (ספרות בלבד)
//   "Wed, 21 Oct 2026 07:28:00 GMT"  ← תאריך HTTP: מתי לנסות שוב
// הפונקציה מחזירה כמה מילישניות לחכות, או null אם אין header או שהוא לא תקין.
// תאריך שכבר עבר ← 0 (אפשר לנסות מיד). now — "עכשיו", כדי שאפשר יהיה לבדוק בלי שעון אמיתי.

const HTTP_DATE = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;

export function parseRetryAfter(value: string | undefined, now: Date = new Date()): number | null {
  if (value === undefined) return null;
  const v = value.trim();
  if (/^\d+$/.test(v)) return Number(v) * 1000;
  if (!HTTP_DATE.test(v)) return null;
  const at = Date.parse(v);
  if (Number.isNaN(at)) return null;
  return Math.max(0, at - now.getTime());
}
