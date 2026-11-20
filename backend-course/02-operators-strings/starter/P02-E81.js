// P02-E81: חישובי הקופה של קפה הפינה — שלוש שורות מדפיסות מספר שגוי.
// הפלט הרצוי — בדף התרגול. תקן רק את החישובים; אל תשנה את הערכים של const.
//
// הרצה:   node 02-operators-strings/starter/P02-E81.js
// בדיקה:  npm run check P02-E81
const coffee = 12;
const pastry = 8;
const people = 4;
const tipPercent = 10;
const cookies = 20;
const perBox = 6;
const side = 3;

const total = coffee + pastry * people;
console.log("סה״כ:", total);
console.log("עם טיפ:", total + total * tipPercent / 100);
console.log("עוגיות שנשארו מחוץ לקופסאות:", cookies / perBox);
console.log("שטח השולחן:", side * 2);
