// P10-E60: משימות ברצף בלי פירמידה
// series(tasks, callback): tasks = [(done) => ...], כל אחת מסיימת עם done(err, result).
//   מריצים אחת אחרי השנייה; בסוף callback(null, results) לפי הסדר
//   שגיאה → callback(err) מיד, בלי להריץ את השאר. מערך ריק → callback(null, []) בטיימר של 0
// בסוף הקובץ: module.exports = { series };
//
// הרצה:   node 10-async/starter/P10-E60.js
// בדיקה:  npm run check P10-E60
