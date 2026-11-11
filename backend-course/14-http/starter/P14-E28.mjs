// P14-E28: לחכות שהשרת יעלה — חזרה על while ו־await
// כתוב וייצא async function waitUntilReady(url, { tries = 10, delayMs = 100 } = {}):
//   fetch(url) — res.ok → מחזירה את מספר הניסיון (1, 2, ...)
//   status אחר, או fetch שנכשל → מחכים delayMs ומנסים שוב (בלי המתנה אחרי הניסיון האחרון)
//   אחרי tries כישלונות → Error(`השרת לא מוכן אחרי ${tries} ניסיונות`). הלולאה — עם while.
//
// הרצה:   node 14-http/starter/P14-E28.mjs
// בדיקה:  npm run check P14-E28
