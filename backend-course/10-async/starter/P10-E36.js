// P10-E36: שעון מתקתק
// ticker(times, ms, onTick, onDone): onTick(1) ... onTick(times), עם המתנה של ms לפני כל אחת,
// ומיד אחרי האחרונה onDone(). את הטיימר הבא רושמים רק אחרי שהקודם רץ.
// times = 0 → רק onDone(), אחרי ms.
// בסוף הקובץ: module.exports = { ticker };
//
// הרצה:   node 10-async/starter/P10-E36.js
// בדיקה:  npm run check P10-E36
