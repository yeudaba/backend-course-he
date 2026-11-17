function createAccount(owner) {
  return {
    owner: owner,
    balance: 0,
    deposit(amount) {
      if (amount <= 0) {
        return false;
      }
      this.balance += amount;
      return true;
    },
    withdraw(amount) {
      if (amount <= 0 || amount > this.balance) {
        return false;
      }
      this.balance -= amount;
      return true;
    },
    summary() {
      return `${this.owner}: ₪${this.balance.toFixed(2)}`;
    },
  };
}

const acc = createAccount("דנה");
console.log(acc.deposit(200), acc.withdraw(79.5), acc.withdraw(500), acc.summary());

module.exports = { createAccount };
