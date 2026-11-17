function runningBalance(start, transactions) {
  const result = [];
  let balance = start;
  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === "in") {
      balance += amount;
    } else {
      balance -= amount;
    }
    result.push(balance);
  }
  return result;
}

console.log(runningBalance(100, [
  { type: "in", amount: "50" },
  { type: "out", amount: "30" },
  { type: "out", amount: 5 },
]));

module.exports = { runningBalance };
