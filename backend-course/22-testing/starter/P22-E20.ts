// P22-E20 — הקוד שבודקים (לא משנים אותו)
export class InsufficientFundsError extends Error {}

export async function transfer(accounts: Map<string, number>, from: string, to: string, amount: number): Promise<void> {
  if (!(amount > 0)) throw new RangeError("הסכום חייב להיות חיובי");
  if (!accounts.has(from) || !accounts.has(to)) throw new RangeError("חשבון לא קיים");
  const balance = accounts.get(from)!;
  if (balance < amount) throw new InsufficientFundsError(`אין מספיק כסף ב־${from}`);
  accounts.set(from, balance - amount);
  accounts.set(to, accounts.get(to)! + amount);
}

// כל החשבונות שהיתרה בהם מתחת לסף
export function lowBalance(accounts: Map<string, number>, threshold: number): string[] {
  return [...accounts].filter(([, balance]) => balance < threshold).map(([name]) => name);
}
