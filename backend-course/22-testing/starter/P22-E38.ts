// P22-E38: מריץ בדיקות משלך
// כתוב וייצא type TestCase = { name, fn }, type Report = { passed: string[], failed: { name, message }[] }
//   ו־runTests(tests, { timeoutMs = 1000 }?): Promise<Report> — אחת אחרי השנייה, מחכה לכל אחת
//   זרקה / נדחתה ← failed (message, או String(value)) | לא הסתיימה בזמן ← `timeout אחרי ${timeoutMs}ms`
//
// הרצה:   node 22-testing/starter/P22-E38.ts
// בדיקה:  npm run check P22-E38
