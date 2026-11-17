// P01-E59: מ־var ל־let ו־const
// הקוד עובד, אבל כתוב בסגנון של לפני 2015. החלף כל var ב־const או ב־let — לפי מה שמתאים.
// הפלט צריך להישאר זהה.
//
// הרצה:   node 01-values-variables/starter/P01-E59.js
// בדיקה:  npm run check P01-E59

var siteName = "החנות שלי";
var visitors = 0;
visitors = visitors + 1;
visitors = visitors + 1;
console.log(siteName, "| מבקרים:", visitors);
