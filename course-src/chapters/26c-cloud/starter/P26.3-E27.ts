// P26.3-E27: חשבון S3 לפי מדרגות — חזרה על לולאה עם מצטבר, Math.min ועיגול
// כתוב וייצא:
//   type Tier = { upTo: number | null; price: number }   (upTo מצטבר; null — "וכל השאר")
//   tieredCost(amount, tiers) — כל חלק במחיר של המדרגה שלו · שלילי או NaN ← RangeError
//   s3Bill({ storageGb, putRequests, getRequests, transferOutGb }) → { storage, requests, transfer, total } בדולרים, מעוגל לסנטים
//     אחסון: עד 51,200GB ‏0.023, עד 512,000GB ‏0.022, מעל ‏0.021 · PUT ‏0.005 לאלף · GET ‏0.0004 לאלף
//     תעבורה החוצה: 100GB ראשונים חינם, עד 10,240GB ‏0.09, מעל ‏0.085
//
// הרצה:   node 26c-cloud/starter/P26.3-E27.ts
// בדיקה:  npm run check P26.3-E27
