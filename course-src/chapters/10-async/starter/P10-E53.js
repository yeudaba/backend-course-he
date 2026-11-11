// P10-E53: לשמור JSON
// saveJson(file, data, callback): JSON.stringify(data, null, 2) ← fs.writeFile ← callback(null).
//   שגיאת כתיבה → callback(err)
//   stringify זורק (למשל 10n) → callback(err) בטיימר של 0, בלי לזרוק ובלי לכתוב
// בסוף הקובץ: module.exports = { saveJson };
//
// הרצה:   node 10-async/starter/P10-E53.js
// בדיקה:  npm run check P10-E53
