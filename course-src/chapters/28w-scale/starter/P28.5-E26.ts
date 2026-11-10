// P28.5-E26: הנפוצים ביותר בזרם, בזיכרון קבוע (Space-Saving) — מקובץ ריק
// כתוב וייצא class TopK<T>:
//   constructor(k) — לכל היותר k מונים · k לא שלם חיובי ← RangeError
//   add(item) — קיים ← count++ · יש מקום ← count 1, error 0 · אחרת: מוחקים את המונה הקטן (min) והחדש מקבל count = min + 1, error = min
//   get seen — כמה פריטים נכנסו · top(n = k) → [{ item, count, error }] מהגבוה לנמוך, בתיקו לפי String(item)
//   שדות פרטיים (#)
//
// הרצה:   node 28w-scale/starter/P28.5-E26.ts
// בדיקה:  npm run check P28.5-E26
