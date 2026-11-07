// P04-E21: שלוש לולאות, שלוש טעויות של "אחד יותר / אחד פחות".
// הפלט הרצוי:
// חודשים: 1 2 3 4 5 6 7 8 9 10 11 12
// תווים: B-A-C-K
// סכום 1..10: 55
let months = "";
for (let m = 1; m < 12; m++) {
  months += m + " ";
}
console.log("חודשים:", months.trim());

const word = "BACK";
let letters = "";
for (let i = 0; i <= word.length; i++) {
  letters += word[i] + "-";
}
console.log("תווים:", letters);

let sum = 0;
for (let i = 0; i < 10; i++) {
  sum += i;
}
console.log("סכום 1..10:", sum);
