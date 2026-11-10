// P09-E27: ניתוח של git log (חזרה על slice, split, map וספירה באובייקט)
// כתוב שתי פונקציות:
//   parseLog(text) — text הוא הפלט של git log --oneline. מחזירה מערך של { hash, message }, שורות ריקות לא נכללות.
//   countTypes(commits) — סופרת לפי הסוג שלפני הנקודתיים: { feat: 2, fix: 1, other: 1 }
//     הסוג הוא מה שלפני ה־":" הראשון, באותיות קטנות — רק אם אין בו רווח. אחרת: "other".
// בסוף הקובץ: module.exports = { parseLog, countTypes };
//
// הרצה:   node 09-git/starter/P09-E27.js
// בדיקה:  npm run check P09-E27
