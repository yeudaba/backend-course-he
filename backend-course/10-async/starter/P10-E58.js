// P10-E58: לקרוא את כל הקבצים במקביל
// readAll(files, callback) — בלי Promises: כל הקריאות יחד.
//   callback(null, texts) — texts[i] = התוכן של files[i]
//   callback(err) — השגיאה הראשונה שהגיעה, ואף פעם לא שוב
//   מערך ריק → callback(null, []) בטיימר של 0
// בסוף הקובץ: module.exports = { readAll };
//
// הרצה:   node 10-async/starter/P10-E58.js
// בדיקה:  npm run check P10-E58
