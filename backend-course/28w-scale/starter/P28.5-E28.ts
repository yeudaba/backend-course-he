// P28.5-E28: דוח של בדיקת עומס — חזרה על padStart/padEnd, toFixed, Intl.NumberFormat, sort ו־map/join
// כתוב וייצא:
//   type Result = { name: string; requests: number; seconds: number; p50: number; p99: number }
//   report(results) → טבלת טקסט: כותרת "name  req/s  p50 ms  p99 ms  " ושורה לכל תוצאה, מהמהיר לאיטי
//     req/s = requests / seconds, מעוגל, עם פסיקים (40,150) · p50/p99 — ספרה אחת · עמודה אחרונה: "fastest" / "4.05x slower"
//     רוחב כל עמודה = הארוך מבין הכותרת והתאים · name והעמודה האחרונה לשמאל (padEnd), המספרים לימין (padStart)
//     בין עמודות שני רווחים, בלי רווחים בסוף שורה · בלי תוצאות ← "" · לא משנים את הקלט
//
// הרצה:   node 28w-scale/starter/P28.5-E28.ts
// בדיקה:  npm run check P28.5-E28
