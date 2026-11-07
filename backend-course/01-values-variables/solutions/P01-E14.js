let balance = 500;
const firstDeposit = 200;
const withdrawal = 350;
const secondDeposit = 50;

balance = balance + firstDeposit;
console.log("הפקדה", firstDeposit, "| יתרה:", balance);

balance = balance - withdrawal;
console.log("משיכה", withdrawal, "| יתרה:", balance);

balance = balance + secondDeposit;
console.log("הפקדה", secondDeposit, "| יתרה:", balance);

console.log("יתרה סופית:", balance);
