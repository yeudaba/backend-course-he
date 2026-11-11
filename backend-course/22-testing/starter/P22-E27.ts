// P22-E27: מטמון LRU עם Map — חזרה על Map, class ו־generics
// כתוב וייצא class LruCache<K, V>:
//   constructor(capacity) — שלם חיובי, אחרת RangeError("capacity חייב להיות מספר שלם חיובי")
//   get(key): V | undefined — וגם "נגיעה" | set(key, value) — מוסיף/מעדכן (גם נגיעה); מעל capacity → יוצא מי שלא נגעו בו הכי הרבה זמן
//   get size | keys() — מהישן לחדש. 0 ו־"" הם ערכים לכל דבר. שדות פרטיים (#), ובלי מערך נוסף — ה־Map שומר סדר.
//
// הרצה:   node 22-testing/starter/P22-E27.ts
// בדיקה:  npm run check P22-E27
