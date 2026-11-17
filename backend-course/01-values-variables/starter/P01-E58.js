// P01-E58: מתקנים את ה־NaN
// הקוד רץ בלי שגיאה, אבל מדפיס "לתשלום: NaN". הפלט הרצוי:
// מחיר: 100
// הנחה: 0
// לתשלום: 100
//
// הרצה:   node 01-values-variables/starter/P01-E58.js
// בדיקה:  npm run check P01-E58

let discount;
const price = 100;
console.log("מחיר:", price);
console.log("הנחה:", discount);
console.log("לתשלום:", price - discount);
