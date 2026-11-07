const temps = "-2,-1,-6,-3,-4,-1,-5";

let sum = 0;
let max = null;
let min = null;
let current = "";
for (let i = 0; i <= temps.length; i++) {
  const ch = temps[i];
  if (ch === "," || i === temps.length) {
    const value = Number(current);
    sum += value;
    if (max === null || value > max) {
      max = value;
    }
    if (min === null || value < min) {
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
