// P08-E60: פירוק שורת at
// parseFrame(line): "    at fn (/p/a.js:2:15)" → { fn: "fn", file: "/p/a.js", line: 2, col: 15 }
// "    at /p/a.js:4:50" → fn: null | "    at Array.map (<anonymous>)" → file: "<anonymous>", line: null, col: null
// בסוף הקובץ: module.exports = { parseFrame };
//
// הרצה:   node 08-modules-errors/starter/P08-E60.js
// בדיקה:  npm run check P08-E60
