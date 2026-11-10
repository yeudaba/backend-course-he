// P29.5-E28: trace כעץ טקסט — חזרה על Map של רשימות, sort עם שני קריטריונים, רקורסיה ו־padEnd/padStart
// כתוב וייצא:
//   type Span = { id: string; parentId: string | null; name: string; start: number; end: number }
//   renderTrace(spans) → שורה לכל span: ("  " × עומק + name).padEnd(32) + `${end - start}ms`.padStart(8)
//     ילדים מתחת להורה, לפי start (בתיקו לפי name) · הורה שלא ב־trace ← השורה מוצגת כשורש · בלי spans ← ""
//
// הרצה:   node 29w-agents/starter/P29.5-E28.ts
// בדיקה:  npm run check P29.5-E28
