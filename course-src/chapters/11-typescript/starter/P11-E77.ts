// P11-E77: הגדרות שרת — עם הודעת שגיאה מדויקת
// כתוב וייצא (export), בלי any ובלי as:
//   type Config = { host: string; port: number; debug: boolean }
//   parseConfig(raw: unknown): Config — זורקת:
//     "ההגדרות חייבות להיות אובייקט" | "host לא תקין" (מחרוזת לא ריקה)
//     "port לא תקין" (שלם 1–65535) | "debug לא תקין" (אם קיים — בוליאני; חסר → false)
//     מחזירה אובייקט חדש עם שלושת השדות בלבד.
//
// הרצה:   node 11-typescript/starter/P11-E77.ts
// בדיקה:  npm run check P11-E77
