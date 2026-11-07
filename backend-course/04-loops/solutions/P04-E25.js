const loan = 10000;
const rate = 0.01;
const monthlyPayment = 1500;

if (monthlyPayment <= loan * rate) {
  console.log("התשלום החודשי לא מכסה את הריבית — ההלוואה לעולם לא תיגמר");
} else {
  let balance = loan;
  let month = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  console.log("חודש  ריבית  תשלום   יתרה");
  while (balance > 0) {
    month++;
    const interest = balance * rate;
    balance += interest;
    const payment = Math.min(monthlyPayment, balance);
    balance -= payment;
    totalPaid += payment;
    totalInterest += interest;
    console.log(
      `${String(month).padEnd(6)}${interest.toFixed(2).padEnd(7)}${payment.toFixed(2).padEnd(8)}${balance.toFixed(2)}`
    );
  }
  console.log("---");
  console.log(`סה״כ שולם: ${totalPaid.toFixed(2)}`);
  console.log(`סה״כ ריבית: ${totalInterest.toFixed(2)}`);
}
