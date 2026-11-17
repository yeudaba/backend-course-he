// P22-E100: createFakeFetch
// כתוב וייצא type FakeReply, type Route, createFakeFetch(routes) ← fetch מזויף עם calls
//   מפתח "GET /tasks" (בלי host ו־query) | calls: { method, path, headers (אותיות קטנות), body } | Response אמיתי
//   route חסר ← 404 { error: "אין route ל־GET /x" }
//
// הרצה:   node 22-testing/starter/P22-E100.ts
// בדיקה:  npm run check P22-E100
