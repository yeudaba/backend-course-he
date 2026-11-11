// P09-E76: סורק סודות
// findSecrets(text) → [{ line, kind }] (שורות מ־1, ממצא אחד לשורה):
// "stripe" — sk_live_ | "private-key" — PRIVATE KEY----- | "assignment" — המילה לפני = מכילה PASSWORD/SECRET/TOKEN/API_KEY,
// והערך (בלי רווחים, ; ומירכאות) לא ריק ולא process.env...
// בסוף הקובץ: module.exports = { findSecrets };
//
// הרצה:   node 09-git/starter/P09-E76.js
// בדיקה:  npm run check P09-E76
