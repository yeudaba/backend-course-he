let months = "";
for (let m = 1; m <= 12; m++) {
  months += m + " ";
}
console.log("חודשים:", months.trim());

const word = "BACK";
let letters = "";
for (let i = 0; i < word.length; i++) {
  if (i > 0) {
    letters += "-";
  }
  letters += word[i];
}
console.log("תווים:", letters);

let sum = 0;
for (let i = 1; i <= 10; i++) {
  sum += i;
}
console.log("סכום 1..10:", sum);
