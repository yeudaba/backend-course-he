// P28-E28: hedged request — חזרה על new Promise, setTimeout, closures ו־then
// כתוב וייצא hedged<T>(fn: (attempt: number) => Promise<T>, delayMs: number): Promise<T>
//   מתחילה fn(1) · אם אחרי delayMs עוד אין תשובה ← גם fn(2) · התשובה הראשונה שהצליחה מנצחת
//   fn(1) נכשלה לפני delayMs ← fn(2) מיד · שתיהן נכשלו ← reject עם השגיאה האחרונה · לכל היותר 2 קריאות
//
// הרצה:   node 28-system-design/starter/P28-E28.ts
// בדיקה:  npm run check P28-E28
