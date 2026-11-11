// P09-E42: לפרק את git status --porcelain
// parseStatus(text): פלט של git status --porcelain → { staged: [...], modified: [...], untracked: [...] }
// ?? → untracked | תו ראשון לא רווח → staged | תו שני לא רווח → modified. שם הקובץ — מהתו הרביעי.
// בסוף הקובץ: module.exports = { parseStatus };
//
// הרצה:   node 09-git/starter/P09-E42.js
// בדיקה:  npm run check P09-E42
