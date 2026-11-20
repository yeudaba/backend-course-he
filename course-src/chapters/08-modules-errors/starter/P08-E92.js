// P08-E92: שלוש פונקציות, ארבעה באגים
// isTime(text): "HH:MM" בלבד, מ־00:00 עד 23:59.
// digitsOnly(phone): מוחקת כל תו שאינו ספרה ("+972 (52) 123-4567" ← "972521234567").
// firstNumber(text): המספר השלם הראשון בטקסט, כ־number. אין מספר ← null.
// הקוד למטה רץ, אבל יש בו באגים. מצא ותקן.
//
// הרצה:   node 08-modules-errors/starter/P08-E92.js
// בדיקה:  npm run check P08-E92

function isTime(text) {
  return /^[0-2]\d:[0-5]\d/.test(text);
}

function digitsOnly(phone) {
  return phone.replace(/-/, "");
}

function firstNumber(text) {
  return Number(text.match(/\d+/)[0]);
}

console.log(isTime("08:30"), isTime("24:00"), isTime("08:300"));
console.log(digitsOnly("052-123-4567"));
console.log(firstNumber("הזמנה 42, 3 פריטים"));

// השורה הזו מאפשרת לבודק להשתמש בפונקציות. אל תמחק אותה.
module.exports = { isTime, digitsOnly, firstNumber };
