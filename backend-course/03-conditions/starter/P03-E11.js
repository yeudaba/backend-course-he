// P03-E11: מ־if/else ל־ternary
// כתוב מחדש עם ternary ו־const בלבד (בלי let ובלי if). הפלט לא משתנה.
//
// הרצה:   node 03-conditions/starter/P03-E11.js
// בדיקה:  npm run check P03-E11

const isOnline = true;
const isExpress = false;
const count = 3;

let status;
if (isOnline) {
  status = "מחובר";
} else {
  status = "לא מחובר";
}

let fee;
if (isExpress) {
  fee = 40;
} else {
  fee = 20;
}

let word;
if (count === 1) {
  word = "הודעה";
} else {
  word = "הודעות";
}
console.log(`${status} | משלוח ${fee} | ${count} ${word}`);
