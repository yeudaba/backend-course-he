// P11-E27: משך זמן — מטקסט למספר ובחזרה
// כתוב וייצא (export):
//   parseDuration(text: string): number | null
//     "1h 30m" → 90, " 2h " → 120, "15m 1h" → 75. מילה לא תקינה (למשל "1.5h", "abc") או טקסט ריק → null
//   formatDuration(minutes: number): string
//     90 → "1h 30m", 120 → "2h", 45 → "45m", 0 → "0m"
//
// הרצה:   node 11-typescript/starter/P11-E27.ts
// בדיקה:  npm run check P11-E27
