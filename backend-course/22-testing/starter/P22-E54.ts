// P22-E54: start — helper לבדיקות HTTP
// כתוב וייצא type Reply = { status, headers, body } ו־start(t, app) ← (method, path, body?) => Promise<Reply>
//   app.listen(0) | t.after ← סוגרים | body ← JSON + Content-Type
//   body בתשובה: JSON אם content-type מכיל json, אחרת טקסט, ריק ← null
//
// הרצה:   node 22-testing/starter/P22-E54.ts
// בדיקה:  npm run check P22-E54
