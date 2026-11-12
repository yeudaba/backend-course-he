// P26-E42: לבנות דירוג מחדש משורות SQL
// כתוב וייצא:
//   rebuildBestsellers(redis, key, rows: { product_id, qty: string | number }[]) → כמה מוצרים נכנסו
//     מחליף את כל התוכן הקודם, ב־MULTI אחד, עם תוקף של יום
//   topBestsellers(redis, key, n) → [{ productId, qty }] מהגבוה לנמוך
//
// בדיקה:  npm run check P26-E42
