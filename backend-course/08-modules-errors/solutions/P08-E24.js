// P08-E24: מודול בנק
function bankError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function assertAmount(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw bankError("INVALID_AMOUNT", "סכום לא תקין");
  }
}

function deposit(account, amount) {
  assertAmount(amount);
  return { ...account, balance: account.balance + amount };
}

function withdraw(account, amount) {
  assertAmount(amount);
  if (account.balance < amount) {
    throw bankError("INSUFFICIENT_FUNDS", "אין מספיק יתרה");
  }
  return { ...account, balance: account.balance - amount };
}

function transfer(from, to, amount) {
  if (from.id === to.id) {
    throw bankError("SAME_ACCOUNT", "לא ניתן להעביר לאותו חשבון");
  }
  const newFrom = withdraw(from, amount);
  const newTo = deposit(to, amount);
  return [newFrom, newTo];
}

function safeTransfer(from, to, amount) {
  try {
    const [newFrom, newTo] = transfer(from, to, amount);
    return { ok: true, from: newFrom, to: newTo };
  } catch (err) {
    return { ok: false, code: err.code, message: err.message, from, to };
  }
}

const a = { id: 1, owner: "דנה", balance: 100 };
const b = { id: 2, owner: "עומר", balance: 20 };
console.log(safeTransfer(a, b, 30));
console.log(safeTransfer(a, b, 500).code);

module.exports = { bankError, deposit, withdraw, transfer, safeTransfer };
