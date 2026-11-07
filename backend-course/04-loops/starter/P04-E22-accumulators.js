// P04-E22: טמפרטורות לילה של שבוע בחורף, כטקסט מופרד בפסיקים.
// החלק שמפרק את הטקסט למספרים (current, value) תקין — הבאגים בצוברים.
// הפלט הרצוי:
// סכום: -22
// הכי חם: -1
// הכי קר: -6
const temps = "-2,-1,-6,-3,-4,-1,-5";

let current = "";
for (let i = 0; i <= temps.length; i++) {
  let sum = 0;
  let max = 0;
  let min = 0;
  const ch = temps[i];
  if (ch === "," || i === temps.length) {
    const value = Number(current);
    sum += value;
    if (value > max) {
      max = value;
    }
    if (value < min) {
      min = value;
    }
    current = "";
  } else {
    current += ch;
  }
}
console.log("סכום:", sum);
console.log("הכי חם:", max);
console.log("הכי קר:", min);
