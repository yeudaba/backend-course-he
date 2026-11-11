// P26.3-E28: סיכום של kubectl get pods — חזרה על טבלת טקסט (P23-E28), destructuring, ספירה ומיון
// כתוב וייצא:
//   type Pod = { name, ready, total, status, restarts, age }  ("1/2" ← ready 1, total 2; "14 (63s ago)" ← 14)
//   parsePods(text) → Pod[] — העמודות לפי הכותרת, מופרדות ב־2 רווחים או יותר
//   podSummary(pods) → { byStatus: { Running: 4, ... }, notReady: [שמות, בלי Completed], restarting: ["name (14)", ...] }
//     restarting: restarts >= 3, מהגבוה לנמוך, בתיקו לפי שם
//
// הרצה:   node 26c-cloud/starter/P26.3-E28.ts
// בדיקה:  npm run check P26.3-E28
