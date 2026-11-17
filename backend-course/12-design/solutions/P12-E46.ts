// P12-E46: אין מספיק כסף
export class InsufficientFundsError extends Error {
  readonly needed: number;
  readonly available: number;
  constructor(needed: number, available: number) {
    super(`נדרשים ${needed}, יש ${available}`);
    this.name = new.target.name;
    this.needed = needed;
    this.available = available;
  }
}

export class AccountLockedError extends Error {
  constructor() {
    super("החשבון נעול");
    this.name = new.target.name;
  }
}

export function withdraw(balance: number, amount: number, locked: boolean): number {
  if (locked) throw new AccountLockedError();
  if (amount > balance) throw new InsufficientFundsError(amount, balance);
  return balance - amount;
}

for (const [b, a, l] of [[100, 30, false], [100, 150, false], [100, 1, true]] as const) {
  try {
    console.log(withdraw(b, a, l));
  } catch (err) {
    if (err instanceof InsufficientFundsError) console.log(String(err), "חסרים:", err.needed - err.available);
    else console.log(String(err));
  }
}
