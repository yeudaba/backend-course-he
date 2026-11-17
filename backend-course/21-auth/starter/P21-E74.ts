// P21-E74: applyPatch — רק שדות מותרים
// כתוב וייצא applyPatch<T extends object>(entity: T, patch: unknown, allowed: readonly (keyof T & string)[]): T
//   patch לא אובייקט רגיל ← Error("גוף לא תקין") | מפתח לא מותר ← Error(`שדה לא מותר: ${key}`)
//   undefined ← מדלגים | אובייקט חדש, entity לא משתנה
//
// הרצה:   node 21-auth/starter/P21-E74.ts
// בדיקה:  npm run check P21-E74
