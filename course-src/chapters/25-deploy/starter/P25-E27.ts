// P25-E27: כמה זמן השרת למעלה — חזרה על / ו־% ועל findIndex, slice, filter, map ו־join
// כתוב וייצא formatUptime(totalSeconds): string
//   יחידות d, h, m, s · מתחילים מהיחידה הגדולה הראשונה שאינה 0, לוקחים שתיים, ומשמיטים אפסים
//   0 → "0s" · 3661 → "1h 1m" · 3601 → "1h" · 90061 → "1d 1h" · לא שלם או שלילי ← RangeError
//
// הרצה:   node 25-deploy/starter/P25-E27.ts
// בדיקה:  npm run check P25-E27
