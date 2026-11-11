// P12-E76: פריטי הזמנה עם נתיב בשגיאה
// כתוב וייצא (export):
//   class ValidationError extends Error — constructor(field, message); readonly field; name נכון
//   parseItems(input: unknown): { productId: number; qty: number }[]
//     מערך של 1–50 → אחרת ("items", "items חייב להיות מערך של 1–50 פריטים")
//     כל פריט: productId שלם חיובי, qty שלם 1–100 → אחרת ("items[2].qty", "items[2].qty לא תקין") (או items[2])
//     אותו productId מתמזג; סכום > 100 → ("items", "יותר מ־100 יחידות של מוצר <id>")
//
// הרצה:   node 12-design/starter/P12-E76.ts
// בדיקה:  npm run check P12-E76
