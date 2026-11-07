const yearlyDeposit = 1000;
const rate = 0.04;
const years = 5;

let balance = 0;
let deposited = 0;
console.log("שנה  הפקדות  יתרה");
for (let year = 1; year <= years; year++) {
  balance += yearlyDeposit;
  deposited += yearlyDeposit;
  balance *= 1 + rate;
  console.log(`${String(year).padEnd(5)}${String(deposited).padEnd(8)}${balance.toFixed(2)}`);
}
