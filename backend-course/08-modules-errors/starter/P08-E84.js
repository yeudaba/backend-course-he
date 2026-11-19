// P08-E84: לפרק שורת לוג
// parseLogLine(line): "2026-11-19T08:30:00Z GET /tasks/42 200 13ms"
//   ← { time, method, path, status, ms } (status ו־ms מספרים). שורה שלא בפורמט ← null.
// method: GET | POST | PUT | PATCH | DELETE. path מתחיל ב־/ ובלי רווחים.
// בסוף הקובץ: module.exports = { parseLogLine };
//
// הרצה:   node 08-modules-errors/starter/P08-E84.js
// בדיקה:  npm run check P08-E84
