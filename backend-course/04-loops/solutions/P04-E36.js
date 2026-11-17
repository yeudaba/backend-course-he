const goal = 5000;
const monthly = 650;
const startBalance = 1200;
let balance = startBalance;
let months = 0;
while (balance < goal) {
  balance += monthly;
  months++;
}
console.log(`אחרי ${months} חודשים: ${balance} ₪`);
