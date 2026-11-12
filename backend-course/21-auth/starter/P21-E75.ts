// P21-E75: decide ו־statusOf
// כתוב וייצא type User, Task, Action, Decision, decide(user | null, action, task?): Decision, statusOf(d): 200 | 401 | 403 | 404
//   אין משתמש ← UNAUTHORIZED | list-all: admin ← OK, אחר ← FORBIDDEN | אין משימה / של אחר ולא admin ← NOT_FOUND
//   update על archived ← FORBIDDEN | אחרת OK
//
// הרצה:   node 21-auth/starter/P21-E75.ts
// בדיקה:  npm run check P21-E75
