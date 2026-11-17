// P10-E52: שני קבצים, אחד אחרי השני
// joinFiles(fileA, fileB, callback): קוראת את fileA, ורק אחרי שהצליחה — את fileB.
//   callback(null, textA + textB) | callback(err) מיד, פעם אחת (בלי לקרוא את השני אם הראשון נכשל)
// בסוף הקובץ: module.exports = { joinFiles };
//
// הרצה:   node 10-async/starter/P10-E52.js
// בדיקה:  npm run check P10-E52
