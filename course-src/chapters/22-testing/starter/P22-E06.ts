// P22-E06 — הקוד שבודקים (לא משנים אותו)
// הופך כותרת לכתובת: "  Learn Node.js 24! " ← "learn-node-js-24"
export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u05d0-\u05ea]+/g, "-") // כל רצף של תווים "אחרים" ← מקף אחד. אותיות עבריות נשארות
    .replace(/^-+|-+$/g, ""); // בלי מקפים בהתחלה ובסוף
}
