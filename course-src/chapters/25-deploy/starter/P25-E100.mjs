// P25-E100: healthcheck.mjs ל־Docker
// כתוב סקריפט: GET http://127.0.0.1:${PORT || 3000}/health — 200 ← exit 0; אחרת / שגיאה / 2 שניות ← stderr ו־exit 1
//
// הרצה:   PORT=3000 node 25-deploy/starter/P25-E100.mjs; echo $?
// בדיקה:  npm run check P25-E100
