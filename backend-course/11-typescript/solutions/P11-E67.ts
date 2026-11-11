// P11-E67: יתרה מאירועים — עם union
export type AccountEvent =
  | { type: "deposit"; amount: number }
  | { type: "withdraw"; amount: number }
  | { type: "fee"; amount: number; reason: string }
  | { type: "freeze" };

export function balance(events: AccountEvent[]): number {
  let total = 0;
  for (const e of events) {
    switch (e.type) {
      case "deposit":
        total += e.amount;
        break;
      case "withdraw":
      case "fee":
        total -= e.amount;
        break;
      case "freeze":
        return total;
    }
  }
  return total;
}

export function feeReasons(events: AccountEvent[]): string[] {
  const reasons: string[] = [];
  for (const e of events) {
    if (e.type === "fee") reasons.push(e.reason);
  }
  return reasons;
}

const events: AccountEvent[] = [
  { type: "deposit", amount: 100 },
  { type: "fee", amount: 5, reason: "דמי ניהול" },
  { type: "withdraw", amount: 30 },
  { type: "freeze" },
  { type: "deposit", amount: 1000 },
];
console.log(balance(events), feeReasons(events));
