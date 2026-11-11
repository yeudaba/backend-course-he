// P07-E28: יתרה מאירועים
const FEE = 5;

function balanceOf(events) {
  return events.reduce((balance, e) => {
    switch (e.type) {
      case "deposit":
        return balance + e.amount;
      case "withdraw":
        return e.amount <= balance ? balance - e.amount : balance;
      case "fee":
        return balance - FEE;
      default:
        return balance;
    }
  }, 0);
}

console.log(
  balanceOf([
    { type: "deposit", amount: 100 },
    { type: "withdraw", amount: 30 },
    { type: "withdraw", amount: 500 },
    { type: "fee" },
    { type: "bonus", amount: 1000 },
  ])
);

module.exports = { balanceOf };
