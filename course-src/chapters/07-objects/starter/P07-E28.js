// P07-E28: יתרה מאירועים (חזרה על switch ו־reduce)
// כתוב פונקציה balanceOf(events) שמחשבת יתרה, מתחילים מ־0:
//   { type: "deposit", amount }  — מוסיפים
//   { type: "withdraw", amount } — מורידים רק אם יש מספיק, אחרת מתעלמים
//   { type: "fee" }              — מורידים 5 תמיד
//   כל type אחר                  — מתעלמים
// השתמש ב־reduce ובתוכו ב־switch.
// בסוף הקובץ: module.exports = { balanceOf };
//
// הרצה:   node 07-objects/starter/P07-E28.js
// בדיקה:  npm run check P07-E28
