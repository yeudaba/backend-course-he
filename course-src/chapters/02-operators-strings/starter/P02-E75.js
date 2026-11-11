// P02-E75: שלוש שורות, שלושה כיווצים
// שלוש השורות האחרונות מדפיסות מספרים שגויים. רוצים:
// פריטים: 4 / סכום: 75 / ממוצע לפריט: 25
// לכל שורה: הערה עם טבלת כיווץ קצרה, ואז תיקון. אל תשנה את שלוש השורות הראשונות.
//
// הרצה:   node 02-operators-strings/starter/P02-E75.js
// בדיקה:  npm run check P02-E75

const qty = "3";
const price = 20;
const shipping = 15;
console.log("פריטים: " + qty + 1);
console.log("סכום: " + qty * price + shipping);
console.log(`ממוצע לפריט: ${qty * price + shipping / qty}`);
