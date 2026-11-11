// P30-E31: מאגר key-value עם טרנזקציות מקוננות — מטלת בית קלאסית, מקובץ ריק
// כתוב וייצא class KVStore:
//   get(key) → string | null · set(key, value) · delete(key) → האם היה קיים · count(value) → כמה מפתחות עם הערך
//   begin() — טרנזקציה חדשה (אפשר בתוך אחרת) · rollback() — מבטל את הפנימית ביותר · commit() — ממזג אותה לזו שמתחתיה
//   commit/rollback בלי טרנזקציה פתוחה ← Error · get depth — כמה פתוחות · שדות פרטיים (#)
//
// הרצה:   node 30-career/starter/P30-E31.ts
// בדיקה:  npm run check P30-E31
