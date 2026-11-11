// P12-E52: כל השגיאות בבת אחת
// כתוב וייצא (export):
//   class LineError extends Error — readonly line; הודעה "שורה <line>: <reason>"
//   class ImportError extends Error — readonly errors: LineError[]; הודעה "<n> שורות לא תקינות"
//   parseExpenses(text): { title; amount }[] — שורות title,amount; ריקות מדלגים
//     "צריך שני שדות" / "כותרת ריקה" / "סכום לא תקין" (לא מספר חיובי)
//     יש שגיאות → throw new ImportError(כולן, לפי הסדר)
//
// הרצה:   node 12-design/starter/P12-E52.ts
// בדיקה:  npm run check P12-E52
